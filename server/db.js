const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "novel_reader_web",
  password: "Loloko1234",
  port: 5432,
});

module.exports = { pool };
