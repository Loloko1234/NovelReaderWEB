import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/NovelLibrary.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner.tsx";

interface Novel {
  id: number;
  title: string;
  author: string;
  cover_image_url: string;
  last_chapter_number: number;
}

const NovelLibrary: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/library", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNovels(response.data);
        setFilteredNovels(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching library:", error);
        setError("Failed to load your library");
      } finally {
        setIsLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      fetchLibrary();
    }
  }, []);

  useEffect(() => {
    let updatedNovels = [...novels];

    // Apply search filter
    if (filter) {
      updatedNovels = updatedNovels.filter((novel) =>
        novel.title.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Apply sorting
    updatedNovels.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredNovels(updatedNovels);
  }, [filter, sortOrder, novels]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner
          size="large"
          message="Loading your library... Please wait"
        />
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="comic-title">Epic Novel Collection</h1>
        <div className="library-controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search for epic tales"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="library-search"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="sort-button"
          >
            {sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
          </button>
        </div>
      </header>
      <main className="home-main">
        <section className="novel-category">
          <div className="novel-grid">
            {filteredNovels.map((novel) => (
              <div
                key={novel.id}
                className="novel-card"
                style={{ backgroundImage: `url(${novel.cover_image_url})` }}
              >
                <div className="novel-info">
                  <h3 className="novel-title">{novel.title}</h3>
                  <p className="novel-chapters">
                    Chapters: {novel.last_chapter_number}
                  </p>
                  <Link to={`/novel/${novel.id}`} className="read-button">
                    Read Now
                  </Link>
                </div>
              </div>
            ))}
            {filteredNovels.length === 0 && (
              <div className="empty-library">
                <h3>No novels found in your library</h3>
                <p>
                  Try adjusting your search or add some novels to your
                  collection!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <p>&copy; 2024 Novel Reader. All rights reserved. No capes!</p>
      </footer>
    </div>
  );
};

export default NovelLibrary;
