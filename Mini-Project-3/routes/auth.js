const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");      // ../ because we're one folder deeper

// A router is a mini-app that holds a group of related routes
const router = express.Router();

// Show the registration form
router.get("/register", (req, res) => {
    res.render("register", { error: null, username: "", email: "" });
});

// Handle the registration form submission
router.post("/register", async (req, res) => {
    // Clean up the submitted values; fall back to "" if a field is missing
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    // Helper: re-show the form with an error and the values already typed
    const showError = (message) => {
        return res.status(400).render("register", { error: message, username, email });
    };

    // Validate the input
    if (!username || !email || !password) {
        return showError("Username, email, and password are all required.");
    }
    if (username.length > 50) {
        return showError("Username must be 50 characters or fewer.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showError("Please enter a valid email address.");
    }
    if (password.length < 8 || password.length > 72) {
        return showError("Password must be between 8 and 72 characters.");
    }

    // Hash the password; only the hash is ever stored
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
            [username, email, passwordHash]
        );
    } catch (err) {
        // 23505 = unique violation, which here means the email is already taken
        if (err.code === "23505") {
            return showError("That email is already registered.");
        }
        // Anything else is unexpected, so let Express handle it
        throw err;
    }

    // Login doesn't exist yet (Phase 4), so send the user to the home page for now
    res.redirect("/");
});

// Show the login form
router.get("/login", (req, res) => {
    res.render("login", { error: null, email: "" });
});

// Handle the login form submission
router.post("/login", async (req, res, next) => {
    // Normalize the email the same way registration does
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    // Helper: re-show the form with an error and the email already typed
    const showError = (message) => {
        return res.status(401).render("login", { error: message, email });
    };

    // Both fields are required
    if (!email || !password) {
        return showError("Invalid email or password.");
    }

    // Look up the account by its unique email
    const result = await pool.query(
        "SELECT id, username, password_hash FROM users WHERE email = $1",
        [email]
    );
    const user = result.rows[0];

    // Unknown email: same message as a wrong password
    if (!user) {
        return showError("Invalid email or password.");
    }

    // Compare the typed password against the stored bcrypt hash
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        return showError("Invalid email or password.");
    }

    // Credentials are valid. Start a fresh session (prevents session fixation)
    req.session.regenerate((err) => {
        if (err) return next(err);

        // Remember who this is; never store the password hash
        req.session.user = { id: user.id, username: user.username };

        // Make sure the session is saved before we redirect
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect("/");
        });
    });
});

// Log out: destroy the session and clear its cookie
router.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

// TEMPORARY: shows what the session holds. 
// router.get("/whoami", (req, res) => {
//     res.json(req.session.user || null);
// });

// Export the router so app.js can mount it
module.exports = router;