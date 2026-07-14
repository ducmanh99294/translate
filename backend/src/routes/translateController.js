const express = require("express");

const router = express.Router();

const translateController = require("../controllers/translateController");

router.post(
    "/on-page",
    translateController.translateOnPage
);

module.exports = router;