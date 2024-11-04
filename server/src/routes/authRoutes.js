const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login route
router.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);

  try {
    const { username, password } = req.body;

    // Get user from database
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // For testing purposes, let's log the received password and stored hash
    console.log("Received password:", password);
    console.log("Stored password hash:", user.password);

    // Compare the plain text password with the stored hash
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Registration route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username or email already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
