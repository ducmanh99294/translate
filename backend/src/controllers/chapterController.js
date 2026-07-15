// controllers/chapter.controller.js
import Chapter from "../models/Chapter.js";
import TextOverlay from "../models/TextOverlay.js";
import TranslationJob from "../models/TranslationJob.js";
import Glossary from "../models/Glossary.js";
import { scrapeChapterImages } from "../services/scraper/index.js";
import { translateFullChapter } from "../services/translation/index.js";
import axios from "axios";

// GET /api/chapters/:id — trả overlay có sẵn, hoặc trigger job nếu chưa xử lý
export async function getChapter(req, res) {
  const { id } = req.params;
  const chapter = await Chapter.findById(id);
  if (!chapter) return res.status(404).json({ error: "Chapter không tồn tại" });

  const allDone = chapter.images.every((img) => img.status === "translated");

  if (allDone) {
    const overlays = await TextOverlay.find({ chapterId: id });
    return res.json({ status: "ready", chapter, overlays });
  }

  // upsert job — tránh tạo trùng nếu nhiều user cùng request 1 lúc (race condition)
  await TranslationJob.findOneAndUpdate(
    { chapterId: id },
    { $setOnInsert: { status: "queued", attempts: 0 } },
    { upsert: true, new: true }
  );

  return res.json({ status: "processing" });
}

// POST /api/chapters/import — { sourceUrl } → scrape ảnh, tạo Chapter + Job
export async function importChapter(req, res) {
  const { sourceUrl, seriesId, chapterNumber, title } = req.body;

  const existing = await Chapter.findOne({ seriesId, chapterNumber });
  if (existing) return res.json({ chapterId: existing._id, status: "already_exists" });

  const images = await scrapeChapterImages(sourceUrl); // trả về [{order, originalUrl, height, width}]

  const chapter = await Chapter.create({
    seriesId,
    chapterNumber,
    title,
    sourceUrl,
    images: images.map((img) => ({ ...img, status: "pending" })),
  });

  await TranslationJob.create({ chapterId: chapter._id, status: "queued" });

  return res.status(201).json({ chapterId: chapter._id, status: "queued" });
}

// GET /api/chapters/:id/status — polling
export async function getChapterStatus(req, res) {
  const job = await TranslationJob.findOne({ chapterId: req.params.id });
  if (!job) return res.json({ status: "not_found" });
  return res.json({ status: job.status, errorMessage: job.errorMessage });
}

// Hàm xử lý thật sự — được gọi bởi worker, không phải route trực tiếp
export async function processTranslationJob(job) {
  const chapter = await Chapter.findById(job.chapterId);
  if (!chapter) throw new Error("Chapter không tồn tại");

  const glossary = await Glossary.find({ seriesId: chapter.seriesId, status: "approved" });

  for (const img of chapter.images) {
    try {
      const imageBuffer = (await axios.get(img.originalUrl, { responseType: "arraybuffer" })).data;
      const { textBlocks, entities } = await translateFullChapter(imageBuffer, glossary);

      await TextOverlay.insertMany(
        textBlocks.map((b) => ({
          chapterId: chapter._id,
          imageOrder: img.order,
          bbox: b.bbox,
          originalText: b.originalText,
          translatedText: b.translatedText,
        }))
      );

      // lưu entity mới phát hiện, chờ admin duyệt
      for (const e of entities) {
        await Glossary.findOneAndUpdate(
          { seriesId: chapter.seriesId, term: e.term },
          {
            $setOnInsert: {
              translation: e.translation,
              type: e.type,
              source: "ai_detected",
              status: "pending_review",
            },
          },
          { upsert: true }
        );
      }

      img.status = "translated";
    } catch (err) {
      img.status = "failed";
      throw err; // để worker set job status = "failed" và có thể retry
    }
  }

  chapter.processedAt = new Date();
  await chapter.save();
}