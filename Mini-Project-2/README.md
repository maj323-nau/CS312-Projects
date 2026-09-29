# Meal Finder

Meal Finder is a small Express application that lets a user search for meals by name. It demonstrates how an HTML form, an Express route, an external API request, and an EJS view work together. Search results come from [TheMealDB](https://www.themealdb.com/).

## Getting Started

Install the project dependencies:

```sh
npm install
```

Start the server:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser. For development, run `npm run dev` to restart the server when files change.

## How It Works

1. The home page displays a form for entering a meal name.
2. Submitting the form sends the search term as a query parameter to the `/search` route.
3. The Express route uses Axios to request matching meals from TheMealDB.
4. The EJS page displays each returned meal's thumbnail, name, category, and cuisine area.
5. If no meals are found, the page shows a no-results message. If the API request fails, it shows a general error message.

The app uses a GET request for searching, so the search term appears in the URL. The search requires a network connection to reach TheMealDB.

## Project Files

- `app.js`: Configures Express, serves the home page, handles meal searches, requests data from TheMealDB, and starts the server.
- `views/index.ejs`: Contains the search form, error messages, and EJS loop that renders meal results.
- `public/css/style.css`: Styles the page.
- `package.json`: Lists the Express, EJS, and Axios dependencies and the `start` and `dev` scripts.
- `package-lock.json`: Records the exact dependency versions installed by npm.

## npm Scripts

- `npm start`: Runs the app with Node.js.
- `npm run dev`: Runs the app in watch mode, restarting it when files change.