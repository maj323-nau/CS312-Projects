# Mini Project 1: Blog Post App

This project is a simple Express app that lets a user create, view, edit, and delete blog posts.

## What this app does

The app starts a web server on port 3000 and responds to browser requests.

It has a list of sample blog posts stored in an array. Each post is an object with:

- id
- title
- author
- content

The app lets the user:

- view the home page
- view all posts
- view one specific post by ID
- create a new post
- edit an existing post
- delete a post

## How it works

### 1. Setting up Express
The app uses the Express package to create a server.

```javascript
const express = require("express");
const app = express();
```

This gives the app tools to create routes and respond to HTTP requests.

### 2. Starting the server
The app listens on port 3000:

```javascript
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

When the server starts, the browser can access pages at:

- http://localhost:3000/
- http://localhost:3000/posts

### 3. Home route
The root route responds with a simple string:

```javascript
app.get("/", (req, res) => {
    res.send("This is the root URL");
});
```

### 4. Viewing all posts
The route `/posts` returns the full array of posts as JSON:

```javascript
app.get("/posts", (req, res) => {
    res.json(posts);
});
```

This is useful for APIs because it sends structured data instead of plain text.

### 5. Viewing one post by ID
The route `/posts/:id` reads the ID from the URL and finds the matching post:

```javascript
app.get("/posts/:id", (req, res) => {
    const id = Number(req.params.id);
    const post = posts.find(post => post.id === id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.json(post);
});
```

If no post matches the ID, the app sends a 404 error.

### 6. Creating a new post
The app uses `express.urlencoded()` so form data can be read from POST requests:

```javascript
app.use(express.urlencoded({ extended: true }));
```

Then the app handles a POST request to `/posts`:

```javascript
app.post("/posts", (req, res) => {
    const newPost = {
        id: nextID++,
        title: req.body.title,
        author: req.body.author,
        content: req.body.content
    };

    posts.push(newPost);

    res.send("Post created!");
});
```

This reads the form values, creates a new object, and adds it to the array.

### 7. Editing a post
When the user visits `/posts/:id/edit`, the app finds the matching post and renders an HTML form:

```javascript
app.get("/posts/:id/edit", (req, res) => {
    const id = Number(req.params.id);
    const post = posts.find(post => post.id === id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.send(`
        <h1>Edit Post</h1>
        <form action="/posts/${post.id}/edit" method="POST">
            ...
        </form>
    `);
});
```

Then a POST route updates the post:

```javascript
app.post("/posts/:id/edit", (req, res) => {
    post.title = req.body.title;
    post.author = req.body.author;
    post.content = req.body.content;

    res.send("Post updated!");
});
```

### 8. Deleting a post
The app also supports a delete route:

```javascript
app.post("/posts/:id/delete", (req, res) => {
    const id = Number(req.params.id);
    const post = posts.find(post => post.id === id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    posts.splice(posts.indexOf(post), 1);

    res.send("Post deleted!");
});
```

This removes the matching object from the posts array.

## Data model

The project stores data in memory in a JavaScript array called `posts`.

Example:

```javascript
const posts = [
    {
        id: 1,
        title: "First Post",
        author: "Mark Johnson",
        content: "This is the content of the first post."
    }
];
```

This means the posts are not permanently saved to a database. They exist only while the server is running.

## EJS views

This project also includes view files in the `views` folder.

- `views/index.ejs` shows the home page
- `views/posts.ejs` shows the list of posts and includes a form to create a post
- `views/post.ejs` shows one post and includes links to edit or delete it

These pages are rendered using EJS templates, which let JavaScript values appear directly in HTML.

## Summary

This app is a small blog-style API and website built with Express. It uses routes to:

- show data
- create data
- update data
- delete data

It is a simple example of how a backend server handles requests and responds with content.
