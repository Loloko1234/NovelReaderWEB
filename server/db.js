const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "novel_reader_web",
  password: "Loloko1234",
  port: 5432,
});

// Add this to test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = { pool };
