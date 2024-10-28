const express = require("express");
const router = express.Router();
const { pool } = require("../../db.js");
const { scrapeChapterContent } = require("../services/chapterScraper");

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Chapter routes working" });
});

// Main chapter endpoint
router.get("/:novelId/:chapterNumber", async (req, res) => {
  const { novelId, chapterNumber } = req.params;
  console.log(
    `Attempting to fetch chapter ${chapterNumber} for novel ${novelId}`
  );

  try {
    // Get chapter URL and title from database
    const result = await pool.query(
      `SELECT chapters.url, chapters.title, novels.title as novel_title 
       FROM chapters 
       JOIN novels ON chapters.novel_id = novels.id 
       WHERE chapters.novel_id = $1 AND chapters.chapter_number = $2`,
      [novelId, chapterNumber]
    );

    console.log("Database query result:", result.rows);

    if (result.rows.length === 0) {
      console.log("No chapter found in database");
      return res.status(404).json({
        error: "Chapter not found",
        details: `No chapter ${chapterNumber} found for novel ${novelId}`,
      });
    }

    const { url, title, novel_title } = result.rows[0];
    console.log("Found chapter:", { url, title });

    if (!url) {
      return res.status(400).json({
        error: "Invalid chapter URL",
        details: "The chapter URL is missing",
      });
    }

    // Scrape the chapter content
    const chapterContent = await scrapeChapterContent(url);

    if (!chapterContent.success) {
      console.error("Scraping failed:", chapterContent.error);
      return res.status(500).json({
        error: "Failed to scrape chapter content",
        details: chapterContent.error,
      });
    }

    res.json({
      novelTitle: novel_title,
      title: title,
      content: chapterContent.content,
      url: url,
      chapterNumber: Number(chapterNumber),
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

module.exports = router;
