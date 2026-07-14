const express = require("express");

const router = express.Router();

const progressController = require("../controllers/progressController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get(
  "/:seriesId",
  authMiddleware,
  progressController.getProgress
);

router.put(
  "/:seriesId",
  authMiddleware,
  progressController.updateProgress
);

module.exports = router;