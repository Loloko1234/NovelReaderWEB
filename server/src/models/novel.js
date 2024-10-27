const pool = require("../config/database.js");

class Novel {
  static async findById(id) {
    const query = "SELECT * FROM novels WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create(novel) {
    const query =
      "INSERT INTO novels (id, title, author, description) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [novel.id, novel.title, novel.author, novel.description];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = Novel;
