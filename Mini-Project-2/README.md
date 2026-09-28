# Meal Finder

A starter Express app for learning how a browser form, an Express server, and EJS templates work together. Axios is included for the planned TheMealDB API request.

## Getting Started

Install the project dependencies:

```sh
npm install
```

Start the server:

```sh
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in a browser. During development, you can use `npm run dev` to restart the server automatically when files change.

## What `package.json` Does

`package.json` is the project's setup and information file. npm reads it to identify the project, install its dependencies, and run its scripts. It must use valid JSON, which does not support comments, so these explanations are kept here instead.

- `name`: The project's npm name, `mini-project-2`.
- `version`: The current project version, `1.0.0`.
- `private`: Prevents accidentally publishing this project to the npm registry.
- `description`: A short summary of the project.
- `main`: Names `app.js` as the main file if another program imports this project.
- `scripts`: Defines commands that can be run with npm. `npm start` runs `node app.js`; `npm run dev` runs it with Node's watch mode.
- `dependencies`: Lists packages the project needs. Express handles web requests, EJS renders page templates, and Axios is included for making HTTP requests to TheMealDB.

The `^` before a dependency version allows npm to install compatible updates that do not change the major version. `npm install` downloads dependencies into `node_modules` and creates or updates `package-lock.json` to record the exact installed versions.

## Project Folders

- `app.js`: Configures Express, serves the home page, and starts the server.
- `views/`: Holds EJS page templates, including `index.ejs`.
- `public/`: Holds browser-accessible files, such as `css/style.css`.
- `routes/`: An optional place to move routes into separate files as the app grows.
- `.gitignore`: Lists local files and folders Git should not track, such as `node_modules/` and `.env`.

The home page currently displays a meal search form. The `/search` route and TheMealDB API request still need to be implemented.
