const Series = require("../models/Series");
const Glossary = require("../models/Glossary");

/**
 * GET /api/series/:id/glossary
 * Query:
 * ?status=approved
 * ?status=pending_review
 */
exports.getGlossary = async (req, res) => {
  try {
    const { status } = req.query;

    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Series không tồn tại",
      });
    }

    const filter = {
      seriesId: req.params.id,
    };

    if (status) {
      filter.status = status;
    }

    const glossary = await Glossary.find(filter).sort({
      term: 1,
    });

    res.json({
      success: true,
      total: glossary.length,
      data: glossary,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/series/:id/glossary
 * Admin thêm thủ công
 */
exports.createGlossary = async (req, res) => {
  try {
    const {
      term,
      translation,
      type,
      note,
    } = req.body;

    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Series không tồn tại",
      });
    }

    const exist = await Glossary.findOne({
      seriesId: req.params.id,
      term,
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Thuật ngữ đã tồn tại",
      });
    }

    const glossary = await Glossary.create({
      seriesId: req.params.id,
      term,
      translation,
      type,
      note,
      source: "admin_manual",
      status: "approved",
    });

    res.status(201).json({
      success: true,
      data: glossary,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PATCH /api/glossary/:id
 * Sửa hoặc duyệt
 */
exports.updateGlossary = async (req, res) => {
  try {
    const glossary = await Glossary.findById(req.params.id);

    if (!glossary) {
      return res.status(404).json({
        success: false,
        message: "Glossary không tồn tại",
      });
    }

    Object.assign(glossary, req.body);

    await glossary.save();

    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: glossary,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DELETE /api/glossary/:id
 */
exports.deleteGlossary = async (req, res) => {
  try {
    const glossary = await Glossary.findById(req.params.id);

    if (!glossary) {
      return res.status(404).json({
        success: false,
        message: "Glossary không tồn tại",
      });
    }

    await glossary.deleteOne();

    res.json({
      success: true,
      message: "Đã xóa glossary",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};