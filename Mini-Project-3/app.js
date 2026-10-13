// CS312 Mini-Project 3
// Mark Johnson

// Running server location (http://localhost:3000)
const PORT = 3000;

// Express package setup
const express = require("express");

// PostgreSQL connection pool (db.js)
const pool = require("./db");

// Authentication routes (register, login, logout)
const authRoutes = require("./routes/auth");

// Session support (keeps users logged in across requests)
const session = require("express-session");

// Express app creation using express() function
const app = express();

// Express Commands

// Set EJS for rendering HTML templates
app.set("view engine", "ejs");

// Parsing post information, browser sent form data
app.use(express.urlencoded({ extended: true }));

// Session middleware: must come before any route that uses req.session
app.use(session({
    secret: process.env.SESSION_SECRET,   // signs the session cookie
    resave: false,                        // don't re-save sessions that didn't change
    saveUninitialized: false,             // don't create sessions for visitors who haven't logged in
    cookie: {
        httpOnly: true,                   // browser JavaScript can't read the cookie
        sameSite: "lax",                  // basic protection against cross-site request forgery
        maxAge: 1000 * 60 * 60 * 24       // cookie lasts 1 day
    }
}));

// Make the logged-in user (or null) available to every EJS template
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// Middleware: only let logged-in users through; guests go to the login page
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Look up who owns a post; returns undefined if the post doesn't exist
async function getPostOwner(id) {
    const result = await pool.query(
        "SELECT author_id FROM posts WHERE id = $1",
        [id]
    );
    return result.rows[0];
}

// Mount the authentication routes
app.use(authRoutes);

// GET request to the root URL ("/") of the server
app.get("/", (req, res) => {
    // Render the "index" view (index.ejs) when the root URL is accessed
    res.render("index");
});

// Second route for the URL "/posts"
app.get("/posts", async (req, res) => {
    // Read all posts from PostgreSQL, joined with each author's username
    const result = await pool.query(
        `SELECT posts.id, posts.title, posts.content, users.username AS author
         FROM posts
         JOIN users ON posts.author_id = users.id
         ORDER BY posts.id`
    );

    // Render the "posts" view and pass the rows to it
    res.render("posts", { posts: result.rows });
});

// Route to show the edit form for a post (owner only)
app.get("/posts/:id/edit", requireLogin, async (req, res) => {

    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // A non-numeric ID can't match any post
    if (!Number.isInteger(id)) {
        return res.status(404).send("Post not found");
    }

    // Read the post's editable fields from PostgreSQL
    const result = await pool.query(
        "SELECT id, title, content, author_id FROM posts WHERE id = $1",
        [id]
    );

    // Get the first row (there should only be one)
    const post = result.rows[0];

    // If no post is found, send a 404 response
    if (!post) {
        return res.status(404).send("Post not found");
    }

    // Ownership check: only the author may open the edit form
    if (post.author_id !== req.session.user.id) {
        return res.status(403).send("You can only edit your own posts.");
    }

    res.render("edit", { post: post });
});

// Different route for posts where the ID is the parameter in the URL
app.get("/posts/:id", async (req, res) => {

    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // A non-numeric ID can't match any post
    if (!Number.isInteger(id)) {
        return res.status(404).send("Post not found");
    }

    // Read one post from PostgreSQL, joined with its author's username
    const result = await pool.query(
        `SELECT posts.id, posts.title, posts.content, posts.author_id, users.username AS author
         FROM posts
         JOIN users ON posts.author_id = users.id
         WHERE posts.id = $1`,
        [id]
    );

    // The first row is the post; undefined means no match
    const post = result.rows[0];

    // If no post is found, send a 404 response
    if (!post) {
        return res.status(404).send("Post not found");
    }

    // Render the "post" view and pass the found post to it
    res.render("post", { post: post });
});

// POST request to the URL "/posts"
app.post("/posts", requireLogin, async (req, res) => {
    // Trim whitespace; fall back to "" if a field is missing
    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();

    // Reject empty titles or content
    if (!title || !content) {
        return res.status(400).send("Title and content are required.");
    }

    // Insert the post. The author comes from the session, never from the form.
    await pool.query(
        "INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3)",
        [title, content, req.session.user.id]
    );

    // Redirect to the posts page after adding the new post
    res.redirect("/posts");
});

// Route for POST request to edit a specific post (owner only)
app.post("/posts/:id/edit", requireLogin, async (req, res) => {

    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // A non-numeric ID can't match any post
    if (!Number.isInteger(id)) {
        return res.status(404).send("Post not found");
    }

    // Ownership check
    const owner = await getPostOwner(id);
    if (!owner) {
        return res.status(404).send("Post not found");
    }
    if (owner.author_id !== req.session.user.id) {
        return res.status(403).send("You can only edit your own posts.");
    }

    // Trim whitespace; fall back to "" if a field is missing
    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();

    // Reject empty titles or content
    if (!title || !content) {
        return res.status(400).send("Title and content are required.");
    }

    // The author_id predicate is a second layer of protection
    const result = await pool.query(
        "UPDATE posts SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND author_id = $4",
        [title, content, id, req.session.user.id]
    );

    // rowCount of 0 means no post had that ID and author_id
    if (result.rowCount === 0) {
        return res.status(404).send("Post not found");
    }

    res.redirect(`/posts/${id}`);
});

// Route for POST request to delete a specific post (owner only)
app.post("/posts/:id/delete", requireLogin, async (req, res) => {

    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // A non-numeric ID can't match any post
    if (!Number.isInteger(id)) {
        return res.status(404).send("Post not found");
    }

    // Ownership check
    const owner = await getPostOwner(id);
    if (!owner) {
        return res.status(404).send("Post not found");
    }
    if (owner.author_id !== req.session.user.id) {
        return res.status(403).send("You can only delete your own posts.");
    }

    // The author_id predicate is a second layer of protection
    const result = await pool.query(
        "DELETE FROM posts WHERE id = $1 AND author_id = $2",
        [id, req.session.user.id]
    );

    // rowCount of 0 means no post had that ID and author_id
    if (result.rowCount === 0) {
        return res.status(404).send("Post not found");
    }

    res.redirect("/posts");
});

// Start the server
app.listen(PORT, () => {
    // log a message to the console when the server is running
    console.log(`Server is running on http://localhost:${PORT}`);
});