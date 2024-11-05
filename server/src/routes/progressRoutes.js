const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const { authenticateToken } = require("../middleware/auth");

// Get user's reading progress for all novels
router.get("/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT urp.*, n.title, n.cover_image_url 
       FROM user_reading_progress urp
       JOIN novels n ON urp.novel_id = n.id
       WHERE urp.user_id = $1
       ORDER BY urp.last_read_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reading progress:", error);
    res.status(500).json({ error: "Failed to fetch reading progress" });
  }
});

// Update reading progress
router.post("/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { novelId, currentPage } = req.body;

    const result = await pool.query(
      `INSERT INTO user_reading_progress (user_id, novel_id, current_page)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, novel_id)
       DO UPDATE SET 
         current_page = $3,
         last_read_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, novelId, currentPage]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating reading progress:", error);
    res.status(500).json({ error: "Failed to update reading progress" });
  }
});

// Delete reading progress
router.delete("/progress/:novelId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { novelId } = req.params;

    await pool.query(
      "DELETE FROM user_reading_progress WHERE user_id = $1 AND novel_id = $2",
      [userId, novelId]
    );

    res.json({ message: "Progress deleted successfully" });
  } catch (error) {
    console.error("Error deleting reading progress:", error);
    res.status(500).json({ error: "Failed to delete reading progress" });
  }
});

module.exports = router;
