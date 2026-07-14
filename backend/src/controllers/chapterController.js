const Chapter = require("../models/Chapter");
const Series = require("../models/Series");
const TextOverlay = require("../models/TextOverlay");
const TranslationJob = require("../models/TranslationJob");

/**
 * GET /api/chapters/:id
 * Nếu đã dịch -> trả overlay
 * Nếu chưa -> tạo job
 */
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter không tồn tại",
      });
    }

    const overlays = await TextOverlay.find({
      chapterId: chapter._id,
    }).sort({
      imageOrder: 1,
    });

    if (overlays.length > 0) {
      return res.json({
        success: true,
        translated: true,
        chapter,
        overlays,
      });
    }

    let job = await TranslationJob.findOne({
      chapterId: chapter._id,
    });

    if (!job) {
      job = await TranslationJob.create({
        chapterId: chapter._id,
        status: "queued",
      });

      // TODO:
      // queue.add(job._id)
      // hoặc publish RabbitMQ/BullMQ
    }

    res.json({
      success: true,
      translated: false,
      jobStatus: job.status,
      chapter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/chapters/import
 * body:
 * {
 *    seriesId,
 *    sourceUrl
 * }
 */
exports.importChapter = async (req, res) => {
  try {
    const { seriesId, sourceUrl } = req.body;

    if (!seriesId || !sourceUrl) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu",
      });
    }

    const series = await Series.findById(seriesId);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Series không tồn tại",
      });
    }

    /**
     * TODO
     * scrape chapter ở đây
     */

    const chapter = await Chapter.create({
      seriesId,
      chapterNumber: 0,
      title: "",
      sourceUrl,
      images: [],
    });

    await TranslationJob.create({
      chapterId: chapter._id,
      status: "queued",
    });

    res.status(201).json({
      success: true,
      message: "Import thành công",
      data: chapter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/chapters/:id/status
 * Polling trạng thái dịch
 */
exports.getStatus = async (req, res) => {
  try {
    const job = await TranslationJob.findOne({
      chapterId: req.params.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy Job",
      });
    }

    res.json({
      success: true,
      status: job.status,
      attempts: job.attempts,
      errorMessage: job.errorMessage,
      updatedAt: job.updatedAt,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};