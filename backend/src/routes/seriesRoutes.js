const express = require("express");
const router = express.Router();

const seriesController = require("../controllers/seriesController");

// Lấy danh sách series
router.get("/", seriesController.getSeries);

// Chi tiết series
router.get("/:id", seriesController.getSeriesById);

// Tạo series
router.post("/", seriesController.createSeries);

// Danh sách chapter của series
router.get("/:id/chapters", seriesController.getSeriesChapters);

module.exports = router;