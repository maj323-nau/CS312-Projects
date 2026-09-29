// This file sets up an Express web server for the Meal Finder application.

// Use port 3000, http://localhost:3000
const PORT = process.env.PORT || 3000;

// Load the axios library for making HTTP requests
const axios = require('axios');

// Load Express web framework
const express = require('express');
const path = require('path');

// Create app instance
const app = express();

// Enable EJS
app.set('view engine', 'ejs');
// EJS template files are stored in views
app.set('views', path.join(__dirname, 'views'));
// Make files in public available to the browser (style.css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Handle GET requests to the home-page URL
app.get('/', (req, res) => {
    // Render the index view with meals and error set to null initially
    // error means any error that occurred during the request
    res.render('index', { meals: null, error: null });
});

// Handle GET requests to the search URL
// "async" allows the use of "await"
app.get('/search', async (req, res) => {
    // Log the query parameters from the request
    console.log(req.query);

    // Extract the meal name from the query parameters
    const mealName = req.query.meal;

    // Log the extracted meal name for debugging purposes
    console.log('mealName is:', mealName);

    // Make a request to the MealDB API to search for the meal by name
    try {
        const response = await axios.get(
            'https://www.themealdb.com/api/json/v1/1/search.php',
            { params: { s: mealName } } // Include the query parameters for API request
        );

        // Successful response

        // Checking content
        const meals = response.data.meals;

        // Render the index view with the fetched meals
        if (meals === null) {
            // If no meals were found, render the index view with an error message.
            res.render('index', { meals: null, error: 'No meals found.' });
        } else {
            // If meals were found, render the index view with the meals.
            res.render('index', { meals: meals, error: null });
        }

    } catch (err) {
        // The request failed (network issue, bad status, etc)
        console.log(err.message);
        res.render('index', { meals: null, error: 'Something went wrong.' });
    }
});

// Start the server
app.listen(PORT, () => {
    // Print the local address after the server has started.
    console.log(`Server listening on http://localhost:${PORT}`);
});
