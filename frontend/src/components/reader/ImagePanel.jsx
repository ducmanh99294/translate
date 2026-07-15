// components/reader/ImagePanel.jsx
import { useState } from "react";
import TextOverlayBox from "./TextOverlayBox";

export default function ImagePanel({ imageUrl, overlays, showOriginal }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
      <img
        src={imageUrl}
        alt=""
        style={{ width: "100%", display: "block" }}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
      {loaded && !showOriginal &&
        overlays.map((block, i) => (
          <TextOverlayBox
            key={i}
            bbox={block.bbox}
            translatedText={block.translatedText}
            backgroundColor={block.backgroundColor}
          />
        ))}
    </div>
  );
}