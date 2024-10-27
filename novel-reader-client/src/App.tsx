import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./styles/app.css";
import NovelLibrary from "./components/NovelLibrary.tsx";
import SignIn from "./api/auth/signin.tsx";
import Home from "./components/Home.tsx";
import Layout from "./components/layout.tsx";
import NovelChapter from "./components/NovelChapter.tsx";
import NovelDetails from "./components/NovelDetails.tsx";

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? element : <Navigate to="/signin" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
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
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
