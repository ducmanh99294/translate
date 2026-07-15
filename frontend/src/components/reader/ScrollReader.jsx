// components/reader/ScrollReader.jsx
import { useEffect, useRef, useState } from "react";
import ImagePanel from "./ImagePanel";

export default function ScrollReader({ chapter, overlaysByImage, showOriginal }) {
  const [visibleSet, setVisibleSet] = useState(new Set([0, 1])); // load 2 ảnh đầu ngay
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSet((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const idx = Number(entry.target.dataset.index);
            if (entry.isIntersecting) next.add(idx);
          });
          return next;
        });
      },
      { rootMargin: "800px 0px" } // preload trước khi ảnh vào viewport
    );

    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [chapter]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {chapter.images.map((img, idx) => (
        <div
          key={img.order}
          ref={(el) => (refs.current[idx] = el)}
          data-index={idx}
          style={{ minHeight: visibleSet.has(idx) ? "auto" : 400 }}
        >
          {visibleSet.has(idx) ? (
            <ImagePanel
              imageUrl={img.originalUrl}
              overlays={overlaysByImage[idx] || []}
              showOriginal={showOriginal}
            />
          ) : (
            <div style={{ height: 400, background: "#f0f0f0" }} /> // placeholder giữ chỗ
          )}
        </div>
      ))}
    </div>
  );
}