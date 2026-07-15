// services/ocr/imageSegmenter.js
import sharp from "sharp";

async function segmentTallImage(imageBuffer, segmentHeight = 1800, overlap = 100) {
  const metadata = await sharp(imageBuffer).metadata();
  const segments = [];
  let y = 0;

  while (y < metadata.height) {
    const height = Math.min(segmentHeight, metadata.height - y);
    const segmentBuffer = await sharp(imageBuffer)
      .extract({ left: 0, top: y, width: metadata.width, height })
      .toBuffer();

    segments.push({
      buffer: segmentBuffer,
      offsetY: y,          // để cộng ngược lại tọa độ gốc sau này
      height
    });

    y += segmentHeight - overlap; // trừ overlap để tránh cắt đúng giữa dòng chữ
  }

  return { segments, originalWidth: metadata.width, originalHeight: metadata.height };
}