// This file sets up an Express web server for the Meal Finder application.

// Load Express web framework
const express = require('express');
const path = require('path');
// Create app instance
const app = express();
// Use port 3000, http://localhost:3000
const PORT = process.env.PORT || 3000;

// Enable EJS
app.set('view engine', 'ejs');
// EJS template files are stored in views
app.set('views', path.join(__dirname, 'views'));
// Make files in public available to the browser (style.css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Handle GET requests to the home-page URL
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
app.listen(PORT, () => {
    // Print the local address after the server has started.
    console.log(`Server listening on http://localhost:${PORT}`);
});
