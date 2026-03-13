const axios = require("axios");

/**
 * Service for communicating with the FastAPI ML service
 */

/**
 * Send clauses to ML service for classification
 * @param {Array} clauses - Array of clause objects
 * @returns {Promise<Object>} - ML service response with classifications
 */
const classifyClauses = async (clauses, attempt = 1) => {
  const mlServiceUrl =
    process.env.ML_SERVICE_URL || "http://localhost:8000/api/classify";
  // Minimum 120s to handle large documents; env var cannot lower below that
  const envTimeout = parseInt(process.env.ML_SERVICE_TIMEOUT);
  const timeout = envTimeout && envTimeout > 120000 ? envTimeout : 120000;

  try {
    console.log(
      `[ML SERVICE] Sending ${clauses.length} clauses to ${mlServiceUrl} (attempt ${attempt}, timeout ${timeout / 1000}s)`,
    );

    const response = await axios.post(
      mlServiceUrl,
      { clauses },
      {
        timeout,
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log(
      `[ML SERVICE] ✓ Successfully classified ${clauses.length} clauses`,
    );
    return response.data;
  } catch (error) {
    console.error("[ML SERVICE] Error details:", {
      attempt,
      code: error.code,
      message: error.message,
      url: mlServiceUrl,
    });

    // Retry once on timeout before giving up
    if (error.code === "ECONNABORTED" && attempt === 1) {
      console.warn("[ML SERVICE] Timeout on attempt 1 — retrying once...");
      return classifyClauses(clauses, 2);
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(
        `ML_SERVICE_TIMEOUT: Classification timed out after ${timeout / 1000}s on both attempts. ` +
          `The ML service at ${mlServiceUrl} is running but not responding in time.`,
      );
    }

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw new Error(
        `ML_SERVICE_OFFLINE: Cannot connect to classification service at ${mlServiceUrl}. ` +
          `Please start the ML service with: cd ml_service && python server.py`,
      );
    }

    if (error.response) {
      const detail =
        error.response.data?.detail ||
        error.response.data?.message ||
        error.response.statusText;
      throw new Error(`ML_SERVICE_ERROR: ${detail}`);
    }

    throw new Error(`ML_SERVICE_ERROR: ${error.message}`);
  }
};

/**
 * Generate mock ML response for testing when ML service is not available
 * @param {Array} clauses - Array of clause objects
 * @returns {Object} - Mock ML response
 */
const generateMockMLResponse = (clauses) => {
  const riskLevels = ["high", "medium", "low", "none"];

  return {
    clauses: clauses.map((clause, index) => ({
      ...clause,
      riskLevel: riskLevels[index % 4],
      confidenceScore: Math.floor(Math.random() * 15) + 85, // 85-99
      plainEnglishSummary: `This clause covers ${clause.clauseTitle.toLowerCase()} and has been analyzed for potential risks.`,
    })),
  };
};

module.exports = {
  classifyClauses,
  generateMockMLResponse,
};
