import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import HomePage from "./pages/HomePage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import ChapterReaderPage from "./pages/ChapterReaderPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
        <Route path="/chapters/:chapterId" element={<ChapterReaderPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}