const pool = require("./db");

async function testConnection() {
    try {
        // Ask the database for the current time
        const time = await pool.query("SELECT NOW()");
        console.log("Connected! Server time:", time.rows[0].now);

        // Confirm both tables exist by listing tables in the public schema
        const tables = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        );
        console.log("Tables found:", tables.rows.map(row => row.table_name));
    } catch (err) {
        console.error("Connection test failed:", err.message);
    } finally {
        // Close the pool so the script exits instead of hanging
        await pool.end();
    }
}

testConnection();