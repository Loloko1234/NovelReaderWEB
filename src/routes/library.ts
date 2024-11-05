import express from "express";
import { authenticateToken } from "../middleware/auth";
import { pool } from "../db";

const router = express.Router();

// Get user's library
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.* FROM novels n
       INNER JOIN user_library ul ON n.id = ul.novel_id
       WHERE ul.user_id = $1
       ORDER BY ul.added_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch library" });
  }
});

// Add novel to library
router.post("/:novelId", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO user_library (user_id, novel_id) VALUES ($1, $2)",
      [req.user.id, req.params.novelId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add to library" });
  }
});

// Remove novel from library
router.delete("/:novelId", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM user_library WHERE user_id = $1 AND novel_id = $2",
      [req.user.id, req.params.novelId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from library" });
  }
});

export default router;
