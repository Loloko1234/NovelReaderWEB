import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLibraryClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/signin");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="logo">Novel Reader</div>
        <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Strona główna
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/library"
                onClick={handleLibraryClick}
                className="nav-link"
              >
                Biblioteka
              </Link>
            </li>
            <li className="nav-item">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="nav-button logout-button"
                >
                  Wyloguj się
                </button>
              ) : (
                <Link to="/signin" className="nav-button login-button">
                  Zaloguj się
                </Link>
              )}
            </li>
          </ul>
        </nav>
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className="menu-icon"></span>
        </button>
      </header>
      <main className="main">{children}</main>
    </div>
  );
};

export default Layout;
