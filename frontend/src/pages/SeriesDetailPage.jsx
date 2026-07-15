import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSeriesById, getSeriesChapters } from "../api/series.api";
import Loader from "../components/common/Loader";

export default function SeriesDetailPage() {
  const { seriesId } = useParams();
  const [series, setSeries] = useState(null);
  const [chapters, setChapters] = useState(null);

  useEffect(() => {
    getSeriesById(seriesId).then((res) => setSeries(res.data));
    getSeriesChapters(seriesId).then((res) => setChapters(res.data));
  }, [seriesId]);

  if (!series || !chapters) return <Loader />;

  return (
    <div style={{ padding: 20 }}>
      <h1>{series.title}</h1>
      <p>{series.originalLanguage} → {series.targetLanguage}</p>
      <ul>
        {chapters.map((c) => (
          <li key={c._id}>
            <Link to={`/chapters/${c._id}`}>Chương {c.chapterNumber} {c.title && `— ${c.title}`}</Link>
          </li>
        ))}
        {chapters.length === 0 && <p>Chưa có chapter nào.</p>}
      </ul>
    </div>
  );
}