import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllSeries } from "../api/series.api";
import Loader from "../components/common/Loader";

export default function HomePage() {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllSeries()
      .then((res) => setSeries(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div style={{ padding: 20, color: "red" }}>Lỗi: {error}</div>;
  if (!series) return <Loader text="Đang tải danh sách truyện..." />;

  return (
    <div style={{ padding: 20 }}>
      <h1>Danh sách truyện</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
        {series.map((s) => (
          <Link
            key={s._id}
            to={`/series/${s._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
              <img
                src={s.coverImageUrl || "https://placehold.co/300x400?text=No+Cover"}
                alt={s.title}
                style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }}
              />
              <div style={{ padding: 8 }}>{s.title}</div>
            </div>
          </Link>
        ))}
        {series.length === 0 && <p>Chưa có truyện nào — thêm truyện qua API `/api/series`.</p>}
      </div>
    </div>
  );
}