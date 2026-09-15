// CS312 Mini-Project 1
// Mark Johnson

// Running server location (http://localhost:3000)
const PORT = 3000;

// Storing local post example data in an array of objects
const posts = [
    {
        id: 1,
        title: "First Post",
        author: "Mark Johnson",
        content: "This is the content of the first post."
    },

    {
        id: 2,
        title: "Second Post",
        author: "Billy Bob",
        content: "This is the content of the second post."
    }
];

// Express package setup
const express = require("express");

// Express app creation using express() function
const app = express();

// Variable to keep track of the next post ID
let nextID = posts.length + 1; 

// Express Commands

// Set EJS for rendering HTML templates
app.set("view engine", "ejs"); 

// Parsing post information, browser sent form data
app.use(express.urlencoded({ extended: true }));

// GET request to the root URL ("/") of the server
app.get("/", (req, res) => { 
    // Render the "index" view (index.ejs) when the root URL is accessed
    res.render("index");
});

// Second route for the URL "/posts"
app.get("/posts", (req, res) => {
    // Render the "posts" view (posts.ejs) and pass the posts array to it
    res.render("posts", { posts: posts }); 
});

// Different route for posts where the ID is the parameter in the URL
app.get("/posts/:id", (req, res) => {

    // Convert the ID parameter to a number
    const id = Number(req.params.id); 

    // Find the post with the matching ID
    const post = posts.find(post => post.id === id); 

    // If no post is found, send a 404 response  
    if (!post) {
        return res.status(404).send("Post not found"); 
    }

    // Render the "post" view (post.ejs) and pass the found post to it
    res.render("post", { post: post });
});

// Route to handle editing a post
app.get("/posts/:id/edit", (req, res) => {

    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // Find the post with the matching ID
    const post = posts.find(post => post.id === id);

    // If no post is found, send a 404 response
    if (!post) {
        return res.status(404).send("Post not found");
    }

    // Send an HTML form to edit the post
    res.send(`
        <h1>Edit Post</h1>
        <form action="/posts/${post.id}/edit" method="POST">

            <label>Title:</label>
            <input type="text" name="title" value="${post.title}" />

            <label>Author:</label>
            <input type="text" name="author" value="${post.author}" />

            <label>Content:</label>
            <textarea name="content">${post.content}</textarea>

            <button type="submit">Update Post</button>

        </form>
    `);
});

// POST request to the URL "/posts"
app.post("/posts", (req, res) => {
    // log the request body to the console  
    console.log(req.body); 

    // Object to hold the new post data
    const newPost = {
        id: nextID++,             // ID is the next available ID
        title: req.body.title,    // Accessing the title from the request body
        author: req.body.author,  // Accessing the author from the request body
        content: req.body.content // Accessing the content from the request body
    };

    // Add the new post to the posts array
    posts.push(newPost);

    // Redirect to the posts page after adding the new post
    res.redirect("/posts"); 
});

// Route for POST request to edit a specific post
app.post("/posts/:id/edit", (req, res) => {
    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // Find the post with the matching ID
    const post = posts.find(post => post.id === id);

    // If no post is found, send a 404 response
    if (!post) {
        return res.status(404).send("Post not found");
    }

    // Update the post with the new data
    post.title = req.body.title;
    post.author = req.body.author;
    post.content = req.body.content;

    // Redirect to the updated post page
    res.redirect(`/posts/${post.id}`); 
});

// Route for POST request to delete a specific post
app.post("/posts/:id/delete", (req, res) => {
    // Convert the ID parameter to a number
    const id = Number(req.params.id);

    // Find the post with the matching ID
    const post = posts.find(post => post.id === id);

    // If no post is found, send a 404 response
    if (!post) {
        return res.status(404).send("Post not found");
    }

    // Remove the post from the posts array
    posts.splice(posts.indexOf(post), 1);

    // Redirect to the posts page after deletion
    res.redirect("/posts");
});

// Start the server
app.listen(PORT, () => {
    // log a message to the console when the server is running
    console.log(`Server is running on http://localhost:${PORT}`); 
});