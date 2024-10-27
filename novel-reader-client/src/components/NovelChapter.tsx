import React, { useState, useEffect } from "react";
import axios from "axios";

interface Chapter {
  title: string;
  url: string;
}

interface NovelData {
  title: string;
  chapters: Chapter[];
  has_more: boolean;
  total_chapters: number;
  current_page: number;
  total_pages: number;
}

const NovelChapter: React.FC = () => {
  const [novelData, setNovelData] = useState<NovelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchNovelData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<NovelData>(
          `http://localhost:5000/api/novel-chapter?page=${currentPage}`
        );
        setNovelData(response.data);
      } catch (err) {
        setError(
          "Nie udało się pobrać danych: " +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNovelData();
  }, [currentPage]);

  const loadMoreChapters = () => {
    if (novelData && currentPage < novelData.total_pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd: {error}</div>;
  if (!novelData) return <div>Brak danych</div>;

  return (
    <div>
      <h1>{novelData.title}</h1>
      <ul>
        {novelData.chapters.map((chapter, index) => (
          <li key={index}>
            <a href={chapter.url}>{chapter.title}</a>
          </li>
        ))}
      </ul>
      {currentPage < novelData.total_pages && (
        <button onClick={loadMoreChapters}>Załaduj więcej rozdziałów</button>
      )}
      <div>
        Strona {currentPage} z {novelData.total_pages}
      </div>
    </div>
  );
};

export default NovelChapter;
