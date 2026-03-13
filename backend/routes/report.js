const express = require("express");
const router = express.Router();
const { generatePDFReport } = require("../controllers/reportController");

/**
 * POST /api/report
 * Generate a downloadable PDF report from analysis results
 *
 * @route POST /api/report
 * @body {Object} - Complete analysis result object
 * @returns {File} - PDF file stream
 */
router.post("/", generatePDFReport);

module.exports = router;
