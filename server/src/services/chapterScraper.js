const axios = require("axios");
const cheerio = require("cheerio");

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

async function scrapeChapterContent(url) {
  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Returning cached content for:", url);
    return cached.data;
  }

  console.log("Starting to scrape URL:", url);

  try {
    // Make the request with appropriate headers to mimic a browser
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
      },
      timeout: 10000, // 10 second timeout
    });

    // Load the HTML content
    const $ = cheerio.load(response.data);

    // Extract chapter title
    const chapterTitle = $(".chr-title").text().trim();

    // Extract paragraphs
    const paragraphs = $("p")
      .map((_, element) => {
        const text = $(element).text().trim();
        // Filter out unwanted content
        if (
          text.length > 0 &&
          !text.includes("Advertisement") &&
          !text.includes("Chapter sponsored by") &&
          !text.includes("This chapter upload first at") &&
          !text.includes("Visit") &&
          !text.includes("for a better experience")
        ) {
          return text;
        }
      })
      .get(); // Convert to array

    if (paragraphs.length === 0) {
      console.error("No paragraphs found after scraping");
      return {
        success: false,
        error: "No paragraphs found on the page",
      };
    }

    const result = {
      success: true,
      content: paragraphs,
      chapterTitle: chapterTitle || `Chapter ${chapterNumber}`, // Fallback title
      url,
    };

    // Cache the result
    cache.set(url, {
      timestamp: Date.now(),
      data: result,
    });

    console.log(`Successfully scraped ${paragraphs.length} paragraphs`);
    return result;
  } catch (error) {
    console.error("Error during scraping:", error);
    return {
      success: false,
      error: error.message || "Failed to scrape content",
    };
  }
}

// Optional: Add a method to clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [url, cached] of cache.entries()) {
    if (now - cached.timestamp > CACHE_DURATION) {
      cache.delete(url);
    }
  }
}, CACHE_DURATION);

module.exports = { scrapeChapterContent };
