// pages/ChapterReaderPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ScrollReader from "../components/reader/ScrollReader";
import { getChapter } from "../api/chapter.api";

export default function ChapterReaderPage() {
  const { chapterId } = useParams();
  const [data, setData] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    let interval;
    async function poll() {
      const res = await getChapter(chapterId);
      if (res.status === "ready") {
        setData(res);
      } else {
        interval = setTimeout(poll, 2000); // poll lại nếu đang xử lý
      }
    }
    poll();
    return () => clearTimeout(interval);
  }, [chapterId]);

  if (!data) return <div>Đang xử lý bản dịch...</div>;

  // gom overlay theo imageOrder để truyền xuống ScrollReader
  const overlaysByImage = {};
  data.overlays.forEach((o) => {
    if (!overlaysByImage[o.imageOrder]) overlaysByImage[o.imageOrder] = [];
    overlaysByImage[o.imageOrder].push(o);
  });

  return (
    <div>
      <button onClick={() => setShowOriginal((s) => !s)}>
        {showOriginal ? "Xem bản dịch" : "Xem ảnh gốc"}
      </button>
      <ScrollReader
        chapter={data.chapter}
        overlaysByImage={overlaysByImage}
        showOriginal={showOriginal}
      />
    </div>
  );
}