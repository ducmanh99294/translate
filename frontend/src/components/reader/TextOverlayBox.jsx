// components/reader/TextOverlayBox.jsx
import { useEffect, useRef, useState } from "react";

export default function TextOverlayBox({ bbox, translatedText, backgroundColor = "#ffffff" }) {
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    let size = 16;
    el.style.fontSize = `${size}px`;

    // Giảm dần cỡ chữ cho tới khi vừa khung, dừng ở mức tối thiểu để tránh chữ quá nhỏ không đọc được
    while (
      (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) &&
      size > 7
    ) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [translatedText, bbox.width, bbox.height]);

  const style = {
    position: "absolute",
    left: `${bbox.x * 100}%`,
    top: `${bbox.y * 100}%`,
    width: `${bbox.width * 100}%`,
    height: `${bbox.height * 100}%`,
    backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "1px 3px",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  return (
    <div style={style} className="text-overlay-box">
      <span
        ref={textRef}
        style={{ fontSize, lineHeight: 1.1, fontWeight: 600, color: "#111", wordBreak: "break-word" }}
      >
        {translatedText}
      </span>
    </div>
  );
}