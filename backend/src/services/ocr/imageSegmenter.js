const sharp = require("sharp");

async function segmentTallImage(imageBuffer, segmentHeight = 1800, overlap = 100) {
  const metadata = await sharp(imageBuffer).metadata();
  const segments = [];
  let y = 0;

  while (y < metadata.height) {
    const height = Math.min(segmentHeight, metadata.height - y);
    const segmentBuffer = await sharp(imageBuffer)
      .extract({ left: 0, top: y, width: metadata.width, height })
      .toBuffer();

    segments.push({ buffer: segmentBuffer, offsetY: y, height });
    y += segmentHeight - overlap;
  }

  return { segments, originalWidth: metadata.width, originalHeight: metadata.height };
}

module.exports = { segmentTallImage };