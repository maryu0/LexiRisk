const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { analyseDocument } = require("../controllers/analyseController");

/**
 * POST /api/analyse
 * Upload and analyse a PDF document
 *
 * @route POST /api/analyse
 * @middleware upload.single('document') - Handles file upload
 * @returns {Object} - Analysis results with risk score and classified clauses
 */
router.post("/", upload.single("document"), analyseDocument);

module.exports = router;
