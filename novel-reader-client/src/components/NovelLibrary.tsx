import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NovelLibrary.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner.tsx";
import { getUserProgress } from "../api/progress.ts";

interface Novel {
  id: number;
  title: string;
  author: string;
  cover_image_url: string;
  last_chapter_number: number;
  current_page?: number;
}

const NovelLibrary: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState<
    Record<number, number>
  >({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLibraryAndProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const [libraryResponse, progressData] = await Promise.all([
          axios.get("http://localhost:5000/api/library", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getUserProgress(),
        ]);

        const progressMap = progressData.reduce(
          (acc: Record<number, number>, curr: any) => {
            acc[curr.novel_id] = curr.current_page;
            return acc;
          },
          {}
        );

        setReadingProgress(progressMap);
        setNovels(libraryResponse.data);
        setFilteredNovels(libraryResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching library:", error);
        setError("Failed to load your library");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraryAndProgress();
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

  const handleCardClick = (novel: Novel) => {
    navigate(`/novel/${novel.id}`);
  };

  const handleReadClick = (e: React.MouseEvent, novel: Novel) => {
    e.stopPropagation(); // Prevent the card click event from firing
    try {
      const startingChapter = readingProgress[novel.id] || 1;
      navigate(`/novel/${novel.id}/chapter/${startingChapter}`);
    } catch (error) {
      console.error("Error navigating to chapter:", error);
    }
  };

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
        <h1 className="comic-title">My Novel Collection</h1>
        <div className="library-controls">
          <div className="search-wrapper">
            <input
              type="text"
              className="library-search"
              placeholder="Search for novels..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button
            className="sort-button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            Sort {sortOrder === "asc" ? "Z-A" : "A-Z"}
          </button>
        </div>
      </header>
      <main className="home-main">
        <section className="novel-category">
          <div className="novel-grid1 novel-grid">
            {filteredNovels.map((novel) => (
              <div
                key={novel.id}
                className="novel-card"
                style={{ backgroundImage: `url(${novel.cover_image_url})` }}
                onClick={() => handleCardClick(novel)}
              >
                <div
                  className="play-button"
                  aria-label="Read novel"
                  onClick={(e) => handleReadClick(e, novel)}
                ></div>
                <div className="novel-info">
                  <h3 className="novel-title">{novel.title}</h3>
                  <p className="novel-chapters">
                    Chapters: {novel.last_chapter_number}
                    {readingProgress[novel.id] && (
                      <span className="current-progress">
                        • Current: Ch.{readingProgress[novel.id]}
                      </span>
                    )}
                  </p>
                  <button
                    className="read-button"
                    onClick={(e) => handleReadClick(e, novel)}
                  >
                    {readingProgress[novel.id]
                      ? "Continue Reading"
                      : "Read Now"}
                  </button>
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
