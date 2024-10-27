const express = require("express");
const novelController = require("../controllers/novelController.js");

const router = express.Router();

router.get("/:id", novelController.getNovelDetails);

module.exports = router;
