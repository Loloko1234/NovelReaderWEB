import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchNovel, Novel } from "../api/novel.ts";
import "../styles/NovelDetails.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner.tsx";

const NovelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNovel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedNovel = await fetchNovel(Number(id));
        setNovel(fetchedNovel);
      } catch (err: any) {
        console.error("Error fetching novel:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load novel details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadNovel();
  }, [id]);

  const handleStartReading = async () => {
    try {
      if (!novel?.id) return;
      setIsLoadingChapter(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:5000/api/novels/${novel.id}/chapters/1/content`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        navigate(`/novel/${novel.id}/chapter/1`);
      } else {
        throw new Error(
          response.data.error || "Failed to load chapter content"
        );
      }
    } catch (err: any) {
      console.error("Error starting reading:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load chapter content"
      );
    } finally {
      setIsLoadingChapter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner
          size="large"
          message="Loading novel details... Please wait"
        />
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!novel) {
    return <div className="error-container">Novel not found</div>;
  }

  return (
    <div className="novel-details-container">
      <div className="novel-details-header">
        <img
          src={novel.cover_image_url}
          alt={novel.title}
          className="novel-cover"
        />
        <div className="novel-info-container">
          <h1 className="novel-title">{novel.title}</h1>
          <p className="novel-author">By {novel.author}</p>
          <div className="novel-stats">
            <span>Chapters: {novel.last_chapter_number}</span>
          </div>
          <p className="novel-description">{novel.description}</p>
          <div className="action-buttons">
            <button
              onClick={handleStartReading}
              className="start-reading-button"
            >
              Start Reading
            </button>
            <Link to="/" className="back-button">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="chapters-section">
        <h2>Chapters</h2>
        <div className="chapters-list">
          {novel.chapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/novel/${novel.id}/chapter/${chapter.chapter_number}`}
              className="chapter-item"
            >
              <span className="chapter-number">
                Chapter {chapter.chapter_number}
              </span>
              <span className="chapter-title">{chapter.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NovelDetails;
