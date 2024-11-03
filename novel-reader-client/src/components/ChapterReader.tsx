import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError, CanceledError } from "axios";
import "../styles/NovelChapter.css";
import LoadingSpinner from "./LoadingSpinner.tsx";

const ChapterReader: React.FC = () => {
  const { novelId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChapters, setTotalChapters] = useState<number>(0);

  const currentChapter = Number(chapterNumber);

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

  const handleNavigateChapter = (direction: "prev" | "next") => {
    const nextChapter =
      direction === "next" ? currentChapter + 1 : currentChapter - 1;
    navigate(`/novel/${novelId}/chapter/${nextChapter}`);
  };

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
    <div className="chapter-container">
      <div className="chapter-header">
        <h1>Chapter {chapterNumber}</h1>
      </div>
      <div className="chapter-navigation">
        <button
          onClick={() => handleNavigateChapter("prev")}
          disabled={currentChapter <= 1}
          className="nav-button prev"
        >
          Previous Chapter
        </button>
        <button
          onClick={() => handleNavigateChapter("next")}
          disabled={currentChapter >= totalChapters}
          className="nav-button next"
        >
          Next Chapter
        </button>
      </div>
      <div className="chapter-content">
        {content.map((paragraph, index) => (
          <p key={index} className="chapter-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="chapter-navigation bottom">
        <button
          onClick={() => handleNavigateChapter("prev")}
          disabled={currentChapter <= 1}
          className="nav-button prev"
        >
          Previous Chapter
        </button>
        <button
          onClick={() => handleNavigateChapter("next")}
          disabled={currentChapter >= totalChapters}
          className="nav-button next"
        >
          Next Chapter
        </button>
      </div>
    </div>
  );
};

export default ChapterReader;
