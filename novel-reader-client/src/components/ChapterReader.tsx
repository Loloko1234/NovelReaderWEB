import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError, CanceledError } from "axios";
import "../styles/ChapterReader.css";
import LoadingSpinner from "./LoadingSpinner.tsx";

const ChapterReader: React.FC = () => {
  const { novelId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(1.25);
  const [readingMode, setReadingMode] = useState("dark"); // dark, sepia, high-contrast
  const [progress, setProgress] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chapterTitle, setChapterTitle] = useState<string>("");

  const currentChapter = Number(chapterNumber);

  const hasPreviousChapter = currentChapter > 1;
  const hasNextChapter = currentChapter < totalChapters;

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const fetchChapterContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        timeoutId = setTimeout(() => {
          controller.abort();
          setError("Request timed out. Please try again.");
          setIsLoading(false);
        }, 30000);

        const response = await axios.get(
          `http://localhost:5000/api/novels/${novelId}/chapters/${chapterNumber}/content`,
          {
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.data.success) {
          setContent(response.data.content);
          setChapterTitle(response.data.chapterTitle);
        } else {
          setError("Failed to load chapter content");
        }
      } catch (error) {
        if (error instanceof CanceledError) {
          return;
        }

        if (error instanceof AxiosError) {
          setError(
            error.response?.data?.error || "Error loading chapter content"
          );
        } else {
          setError("An unexpected error occurred");
        }
        console.error("Error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchChapterContent();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [novelId, chapterNumber]);

  useEffect(() => {
    const fetchNovelInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/novels/${novelId}`
        );
        setTotalChapters(response.data.last_chapter_number);
      } catch (error) {
        console.error("Error fetching novel info:", error);
      }
    };

    fetchNovelInfo();
  }, [novelId]);

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    setProgress((scrolled / total) * 100);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleNavigateChapter = (direction: "prev" | "next") => {
    if (direction === "prev" && !hasPreviousChapter) return;
    if (direction === "next" && !hasNextChapter) return;

    const nextChapter =
      direction === "next" ? currentChapter + 1 : currentChapter - 1;
    navigate(`/novel/${novelId}/chapter/${nextChapter}`);
  };

  // Create a reusable navigation component
  const NavigationButtons = () => (
    <nav className="chapter-navigation">
      <button
        className="nav-button previous-chapter"
        onClick={() => handleNavigateChapter("prev")}
        disabled={!hasPreviousChapter}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
        Previous
      </button>
      <button
        className="nav-button next-chapter"
        onClick={() => handleNavigateChapter("next")}
        disabled={!hasNextChapter}
      >
        Next
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
        </svg>
      </button>
    </nav>
  );

  if (isLoading) {
    return (
      <div className="chapter-container">
        <LoadingSpinner
          size="large"
          message="Loading chapter content... Please wait"
        />
        <div className="loading-tips">
          <p>This may take a few moments to load the chapter.</p>
          <p>If loading persists, try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chapter-container">
        <div className="chapter-error">
          <h2>Error Loading Chapter</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Try Again
            </button>
            <button onClick={() => navigate(-1)} className="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chapter-reader ${readingMode}-mode`}>
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      {/* Top Navigation */}
      <NavigationButtons />
      <div className="title-container">
        <h1 className="chapter-title">{chapterTitle}</h1>
      </div>

      {/* Settings Button */}
      <button
        className="settings-button"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
      </button>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="settings-panel">
          <div className="settings-group">
            <label>Font Size</label>
            <div className="font-size-controls">
              <button
                className="font-size-button"
                onClick={() => setFontSize((prev) => Math.max(0.8, prev - 0.1))}
              >
                A-
              </button>
              <button
                className="font-size-button"
                onClick={() => setFontSize((prev) => Math.min(2, prev + 0.1))}
              >
                A+
              </button>
            </div>
          </div>

          <div className="settings-group">
            <label>Reading Mode</label>
            <select
              className="reading-mode-select"
              value={readingMode}
              onChange={(e) => setReadingMode(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="sepia">Sepia</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>
        </div>
      )}

      <div className="chapter-content" style={{ fontSize: `${fontSize}rem` }}>
        {content.map((paragraph, index) => (
          <p key={index} className="chapter-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Bottom Navigation */}
      <NavigationButtons />
    </div>
  );
};

export default ChapterReader;
