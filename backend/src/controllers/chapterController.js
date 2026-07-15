const Chapter = require("../models/Chapter");
const TextOverlay = require("../models/TextOverlay");
const TranslationJob = require("../models/TranslationJob");
const Glossary = require("../models/Glossary");
const { scrapeChapterImages } = require("../services/scraper");
const { translateFullChapter } = require("../services/translation");

exports.getChapter = async (req, res) => {
  const { id } = req.params;
  const chapter = await Chapter.findById(id);
  if (!chapter) return res.status(404).json({ success: false, message: "Chapter không tồn tại" });

  const allDone = chapter.images.every((img) => img.status === "translated");

  if (allDone) {
    const overlays = await TextOverlay.find({ chapterId: id });
    return res.json({ status: "ready", chapter, overlays });
  }

  await TranslationJob.findOneAndUpdate(
    { chapterId: id },
    { $setOnInsert: { status: "queued", attempts: 0 } },
    { upsert: true, new: true }
  );

  res.json({ status: "processing" });
};

exports.importChapter = async (req, res) => {
  try {
    const { sourceUrl, seriesId, chapterNumber, title } = req.body;

    const existing = await Chapter.findOne({ seriesId, chapterNumber });
    if (existing) return res.json({ chapterId: existing._id, status: "already_exists" });

    const images = await scrapeChapterImages(sourceUrl);

    const chapter = await Chapter.create({
      seriesId,
      chapterNumber,
      title,
      sourceUrl,
      images: images.map((img) => ({ ...img, status: "pending" })),
    });

    await TranslationJob.create({ chapterId: chapter._id, status: "queued" });

    res.status(201).json({ chapterId: chapter._id, status: "queued" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStatus = async (req, res) => {
  const job = await TranslationJob.findOne({ chapterId: req.params.id });
  if (!job) return res.json({ status: "not_found" });
  res.json({ status: job.status, errorMessage: job.errorMessage });
};

exports.processTranslationJob = async (job) => {
  const chapter = await Chapter.findById(job.chapterId);
  if (!chapter) throw new Error("Chapter không tồn tại");

  const glossary = await Glossary.find({ seriesId: chapter.seriesId, status: "approved" });

  for (const img of chapter.images) {
    try {
      // dùng fetch built-in thay vì axios
      const response = await fetch(img.originalUrl);
      if (!response.ok) throw new Error(`Tải ảnh thất bại: HTTP ${response.status}`);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

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
      throw err;
    }
  }

  chapter.processedAt = new Date();
  await chapter.save();
};