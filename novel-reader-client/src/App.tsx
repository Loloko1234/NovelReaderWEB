import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./styles/app.css";
import NovelLibrary from "./components/NovelLibrary.tsx";
import Login from "./components/Login.tsx";
import Home from "./components/Home.tsx";
import Layout from "./components/layout.tsx";
import NovelChapter from "./components/NovelChapter.tsx";
import NovelDetails from "./components/NovelDetails.tsx";
import ChapterReader from "./components/ChapterReader.tsx";
import Register from "./components/Register.tsx";

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/library"
            element={<PrivateRoute element={<NovelLibrary />} />}
          />
          <Route
            path="/novel-chapter"
            element={<PrivateRoute element={<NovelChapter />} />}
          />
          <Route path="/novelchapter" element={<NovelChapter />} />
          <Route path="/novel/:id" element={<NovelDetails />} />
          <Route
            path="/novel/:novelId/chapter/:chapterNumber"
            element={<ChapterReader />}
          />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
