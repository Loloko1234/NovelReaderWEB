import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError, CanceledError } from "axios";
import "../styles/NovelChapter.css";

const ChapterReader: React.FC = () => {
  const { novelId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Ignore canceled requests
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

  if (isLoading) {
    return (
      <div className="chapter-container">
        <div className="chapter-loading">
          <div className="loading-spinner"></div>
          <p>Loading chapter... This may take a few moments.</p>
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
          <button onClick={() => window.location.reload()}>Try Again</button>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-container">
      <div className="chapter-header">
        <h1>Chapter {chapterNumber}</h1>
      </div>
      <div className="chapter-content">
        {content.map((paragraph, index) => (
          <p key={index} className="chapter-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ChapterReader;
