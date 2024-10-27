import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchNovels, Novel } from "../api/novel.ts";
import "../styles/home.css";

const Home: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNovels = async () => {
      try {
        setIsLoading(true);
        const fetchedNovels = await fetchNovels();
        setNovels(fetchedNovels);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching novels:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Nie udało się pobrać danych powieści"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadNovels();
  }, []);

  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading-spinner">Ładowanie...</div>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Błąd:</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="comic-title">Novel Reader</h1>
        <p className="tagline">Your Epic Adventure Awaits!</p>
      </header>
      <main className="home-main">
        <section className="novel-category">
          <h2 className="category-title">Featured Novels</h2>
          <div className="novel-grid">
            {novels.map((novel) => (
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
            {[...Array(Math.max(0, 4 - novels.length))].map((_, index) => (
              <div key={`empty-${index}`} className="novel-card empty-card">
                <div className="novel-info">
                  <h3 className="novel-title">Coming Soon</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="cta">
          <Link to="/library" className="cta-button">
            Explore Full Library
          </Link>
        </section>
      </main>
      <footer className="home-footer">
        <p>&copy; 2024 Novel Reader. All rights reserved. No capes!</p>
      </footer>
    </div>
  );
};

export default Home;
