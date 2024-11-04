import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Layout.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className={`header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-content">
          <Link to="/" className="logo">
            Novel Reader
          </Link>

          <button
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>☰</span>
          </button>

          <nav>
            <ul className={`nav-list ${isMenuOpen ? "active" : ""}`}>
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/library" className="nav-link">
                  Library
                </Link>
              </li>
              <div className="auth-buttons">
                {localStorage.getItem("token") ? (
                  <button
                    onClick={handleLogout}
                    className="nav-button login-button"
                  >
                    Logout
                  </button>
                ) : (
                  <Link to="/login" className="nav-button login-button">
                    Login
                  </Link>
                )}
              </div>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
