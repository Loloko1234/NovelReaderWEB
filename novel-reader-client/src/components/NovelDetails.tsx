import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchNovel, Novel } from "../api/novel.ts";
import "../styles/NovelDetails.css";

const NovelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNovel = async () => {
      try {
        setIsLoading(true);
        const fetchedNovel = await fetchNovel(Number(id));
        setNovel(fetchedNovel);
      } catch (err: any) {
        console.error("Error fetching novel:", err);
        setError(err.message || "Failed to load novel details");
      } finally {
        setIsLoading(false);
      }
    };

    loadNovel();
  }, [id]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
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
            <Link
              to={`/novel/${novel.id}/chapter/1`}
              className="start-reading-button"
            >
              Start Reading
            </Link>
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
