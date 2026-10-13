// Loads values from .env into process.env
require("dotenv").config();

// Import the Pool class from the pg module
const { Pool } = require("pg");

// Connection pool built from environment configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Export the pool so routes can use pool.query(...)
module.exports = pool;