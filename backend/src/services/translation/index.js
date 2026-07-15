const { segmentTallImage } = require("../ocr/imageSegmenter");
const { translateImageSegment } = require("./claudeClient");

async function translateFullChapter(imageBuffer, glossary) {
  const { segments, originalHeight } = await segmentTallImage(imageBuffer);
  const allTextBlocks = [];
  const allEntities = [];

  for (const seg of segments) {
    const base64 = seg.buffer.toString("base64");
    const result = await translateImageSegment(base64, glossary);

    for (const block of result.textBlocks) {
      const absoluteY = seg.offsetY + block.bbox.y * seg.height;
      allTextBlocks.push({
        ...block,
        bbox: {
          x: block.bbox.x,
          y: absoluteY / originalHeight,
          width: block.bbox.width,
          height: (block.bbox.height * seg.height) / originalHeight,
        },
      });
    }
    allEntities.push(...result.detectedEntities);
  }

  return { textBlocks: allTextBlocks, entities: allEntities };
}

module.exports = { translateFullChapter };