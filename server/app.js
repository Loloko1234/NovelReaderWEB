const express = require("express");
const cors = require("cors");
const novelRoutes = require("./src/routes/novelRoutes.js");
const { pool } = require("./db");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware do logowania requestów
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Endpoint do testowania połączenia
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// Endpoint do pobierania wszystkich powieści
app.get("/api/novels", async (req, res) => {
  try {
    console.log("Fetching novels from database...");
    const result = await pool.query("SELECT * FROM novels ORDER BY id DESC");
    console.log(`Found ${result.rows.length} novels`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Endpoint do pobierania pojedynczej powieści
app.get("/api/novels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching novel with id ${id}`);

    // Get novel details
    const novelResult = await pool.query("SELECT * FROM novels WHERE id = $1", [
      id,
    ]);

    if (novelResult.rows.length === 0) {
      return res.status(404).json({ message: "Novel not found" });
    }

    // Get chapters with URLs
    const chaptersResult = await pool.query(
      "SELECT id, chapter_number, title, url FROM chapters WHERE novel_id = $1 ORDER BY chapter_number ASC",
      [id]
    );

    // Combine novel data with chapters
    const novel = {
      ...novelResult.rows[0],
      chapters: chaptersResult.rows,
    };

    res.json(novel);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.use("/api/novel", novelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/api/test`);
});
