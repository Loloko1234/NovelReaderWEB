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

app.get("/api/novels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM novels WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Novel not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.use("/api/novel", novelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
