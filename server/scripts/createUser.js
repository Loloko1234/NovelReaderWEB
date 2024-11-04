const bcrypt = require("bcrypt");
const { pool } = require("../db");

async function createUser() {
  try {
    const username = "1234";
    const password = "1234";
    const saltRounds = 10;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );

    console.log("User created successfully:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
}

createUser();
