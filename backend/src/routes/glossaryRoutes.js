const express = require("express");

const router = express.Router();

const glossaryController = require("../controllers/glossaryController");

/**
 * Series Glossary
 */

router.get(
    "/series/:id/glossary",
    glossaryController.getGlossary
);

router.post(
    "/series/:id/glossary",
    glossaryController.createGlossary
);

/**
 * Glossary
 */

router.patch(
    "/glossary/:id",
    glossaryController.updateGlossary
);

router.delete(
    "/glossary/:id",
    glossaryController.deleteGlossary
);

module.exports = router;