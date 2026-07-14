const Series = require("../models/Series");
const Chapter = require("../models/Chapter");

/**
 * GET /api/series
 * Lấy danh sách truyện
 */
exports.getSeries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      keyword,
      status,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (keyword) {
      filter.title = {
        $regex: keyword,
        $options: "i",
      };
    }

    const total = await Series.countDocuments(filter);

    const data = await Series.find(filter)
      .sort({
        updatedAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/series/:id
 * Chi tiết truyện
 */
exports.getSeriesById = async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Series không tồn tại",
      });
    }

    res.json({
      success: true,
      data: series,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/series
 * Tạo truyện mới
 */
exports.createSeries = async (req, res) => {
  try {
    const {
      title,
      sourceUrl,
      sourceSite,
      originalLanguage,
      targetLanguage,
      coverImageUrl,
      status,
    } = req.body;

    const series = await Series.create({
      title,
      sourceUrl,
      sourceSite,
      originalLanguage,
      targetLanguage,
      coverImageUrl,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Tạo series thành công",
      data: series,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/series/:id/chapters
 * Danh sách chapter của truyện
 */
exports.getSeriesChapters = async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Series không tồn tại",
      });
    }

    const chapters = await Chapter.find({
      seriesId: req.params.id,
    }).sort({
      chapterNumber: 1,
    });

    res.json({
      success: true,
      total: chapters.length,
      data: chapters,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};