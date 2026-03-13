const { generateReport } = require("../services/reportGenerator");

/**
 * Controller for report generation endpoint
 */

/**
 * Generate and download PDF report from analysis results
 */
const generatePDFReport = async (req, res, next) => {
  try {
    const analysisResult = req.body;

    // Validate that required data is present
    if (
      !analysisResult ||
      !analysisResult.documentName ||
      !analysisResult.clauses
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid analysis data. Please provide complete analysis results.",
      });
    }

    console.log(
      `[REPORT] Generating report for: ${analysisResult.documentName}`,
    );

    // Generate and stream the PDF report
    generateReport(analysisResult, res);

    console.log(`[REPORT] ✓ Report generated successfully`);
  } catch (error) {
    console.error("[REPORT] Error:", error.message);
    next(error);
  }
};

module.exports = {
  generatePDFReport,
};
