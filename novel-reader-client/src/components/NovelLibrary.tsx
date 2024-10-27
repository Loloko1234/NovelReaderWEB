import React, { useState, useEffect } from "react";
import "../styles/NovelLibrary.css";

// Sample data structure for novels
interface Novel {
  id: number;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  imageUrl: string; // Add imageUrl property
}

const NovelLibrary: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    // Fetch novels from an API or use static data
    const fetchNovels = async () => {
      // Replace with actual data fetching
      const data: Novel[] = [
        {
          id: 1,
          title: "I Became The King by Scavenging",
          author: "Author A",
          genre: "Fantasy",
          publishedYear: 2020,
          imageUrl: "/solo.jpg", // Path to the image in the public directory
        },
        {
          id: 2,
          title: "Levelling Up In An Exclusive Dungeon",
          author: "Author B",
          genre: "Sci-Fi",
          publishedYear: 2019,
          imageUrl: "/solo.jpg", // Use the same or different image
        },
        // Add more novels
      ];
      setNovels(data);
      setFilteredNovels(data);
    };

    fetchNovels();
  }, []);

  useEffect(() => {
    // Filter and sort novels whenever filter or sortOrder changes
    let updatedNovels = novels.filter((novel) =>
      novel.title.toLowerCase().includes(filter.toLowerCase())
    );

    updatedNovels = updatedNovels.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

    setFilteredNovels(updatedNovels);
  }, [filter, sortOrder, novels]);

  return (
    <div className="novel-library">
      <header className="library-header">
        <h1 className="library-title">Epic Novel Collection</h1>
        <div className="library-controls">
          <input
            type="text"
            placeholder="Search for epic tales"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="library-search"
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="library-sort-button"
          >
            Sort {sortOrder === "asc" ? "Z-A" : "A-Z"}
          </button>
        </div>
      </header>
      <div className="novel-grid">
        {filteredNovels.map((novel) => (
          <div className="novel-card" key={novel.id}>
            <img
              src={novel.imageUrl}
              alt={novel.title}
              className="novel-image"
            />
            <div className="novel-info">
              <h2 className="novel-title">{novel.title}</h2>
              <p className="novel-author">{novel.author}</p>
              <p className="novel-genre">{novel.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovelLibrary;
