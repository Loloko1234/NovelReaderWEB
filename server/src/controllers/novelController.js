const axios = require("axios");
const cheerio = require("cheerio");

exports.getNovelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const url = `https://novelbin.com/b/${id}`;

    console.log(`Fetching novel details from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    const $ = cheerio.load(response.data);

    const novel = {
      id,
      title: $("h3.title").text().trim(),
      author: $('a[href^="https://novelbin.com/a/"]').text().trim(),
      description: $("div.desc").text().trim(),
      coverUrl: $("div.book img").attr("src"),
    };

    console.log("Parsed novel details:", novel);

    res.json(novel);
  } catch (error) {
    console.error("Error fetching novel details:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }
    res
      .status(500)
      .json({ error: "Failed to fetch novel details", message: error.message });
  }
};
