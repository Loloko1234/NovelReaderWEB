import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../../data/users.ts";
import "../../styles/SignIn.css";

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", user.id.toString());
      navigate("/library");
    } else {
      setError("Nieprawidłowa nazwa użytkownika lub hasło");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1 className="signin-title">Logowanie</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="signin-form">
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="signin-input"
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signin-input"
          />
          <button type="submit" className="signin-button">
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
