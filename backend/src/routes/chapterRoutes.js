const express = require("express");

const router = express.Router();

const chapterController = require("../controllers/chapterController");

router.get("/:id", chapterController.getChapter);

router.post("/import", chapterController.importChapter);

router.get("/:id/status", chapterController.getStatus);

module.exports = router;