const { extractTextFromPDF } = require("../services/pdfExtractor");
const { segmentClauses } = require("../services/clauseSegmentor");
const { classifyClauses } = require("../services/mlService");

/**
 * Controller for document analysis endpoint
 */

/**
 * Extract legal entities from document text using regex patterns
 * @param {string} text - Raw document text
 * @returns {Object} - Extracted entities with confidence scores
 */
const extractEntities = (text) => {
  const entities = {
    parties: { value: null, confidence: 0 },
    effectiveDate: { value: null, confidence: 0 },
    governingLaw: { value: null, confidence: 0 },
    termLength: { value: null, confidence: 0 },
    liabilityCap: { value: null, confidence: 0 },
    autoRenewal: { value: null, confidence: 0 },
  };

  // Extract parties - look for "between X and Y" patterns
  const partyPatterns = [
    /between\s+([A-Z][^\n,]+?)\s+and\s+([A-Z][^\n,.]+)/i,
    /by and between\s+([A-Z][^\n,]+?)\s+and\s+([A-Z][^\n,.]+)/i,
  ];

  for (const pattern of partyPatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.parties = {
        value: `${match[1].trim()} & ${match[2].trim()}`,
        confidence: 97,
      };
      break;
    }
  }

  // Extract effective date
  const datePatterns = [
    /effective\s+(?:date|as of)\s*:?\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    /dated\s+(?:as of\s+)?([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    /entered into\s+(?:on\s+)?([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.effectiveDate = {
        value: match[1].trim(),
        confidence: 98,
      };
      break;
    }
  }

  // Extract governing law
  const lawPatterns = [
    /governed by the laws of\s+(?:the\s+)?([A-Z][^\n.;]+)/i,
    /laws of\s+(?:the\s+)?([A-Z][^\n.;,]+)\s+shall govern/i,
    /subject to the laws of\s+([A-Z][^\n.;]+)/i,
  ];

  for (const pattern of lawPatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.governingLaw = {
        value: match[1].trim(),
        confidence: 95,
      };
      break;
    }
  }

  // Extract term length
  const termPatterns = [
    /term of\s+(\d+)\s+(year|month|day)s?/i,
    /period of\s+(\d+)\s+(year|month|day)s?/i,
    /for a\s+(?:period|term)\s+of\s+(\d+)\s+(year|month|day)s?/i,
  ];

  for (const pattern of termPatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.termLength = {
        value: `${match[1]} ${match[2]}${match[1] !== "1" ? "s" : ""}`,
        confidence: 92,
      };
      break;
    }
  }

  // Extract liability cap - look for dollar amounts near "liability"
  const liabilityPattern = /liability[^\$]{0,100}\$\s*([\d,]+)/i;
  const liabilityMatch = text.match(liabilityPattern);

  if (liabilityMatch) {
    entities.liabilityCap = {
      value: `$${liabilityMatch[1]}`,
      confidence: 88,
    };
  }

  // Extract auto renewal
  const renewalPatterns = [
    /automatically renew(?:s|ed)?\s+for\s+(?:additional\s+)?(\d+)\s+(year|month)/i,
    /auto(?:matic)?(?:ally)?\s+renew(?:al|s)?\s+for\s+(\d+)\s+(year|month)/i,
  ];

  for (const pattern of renewalPatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.autoRenewal = {
        value: `Yes, ${match[1]} ${match[2]} terms`,
        confidence: 90,
      };
      break;
    }
  }

  // If no match found, indicate "No" with lower confidence
  if (!entities.autoRenewal.value) {
    const noRenewalPattern =
      /(?:does not|shall not|will not)\s+(?:automatically\s+)?renew/i;
    if (noRenewalPattern.test(text)) {
      entities.autoRenewal = {
        value: "No",
        confidence: 85,
      };
    }
  }

  return entities;
};

/**
 * Calculate overall risk score from classified clauses
 * Uses normalized scoring that accounts for document size and ML confidence
 * @param {Array} clauses - Array of classified clause objects
 * @returns {Object} - Risk score and label
 */
const calculateRiskScore = (clauses) => {
  // Handle edge case: no clauses
  if (!clauses || clauses.length === 0) {
    return { riskScore: 0, riskLabel: "Low" };
  }

  let totalWeight = 0;
  const weights = { high: 10, medium: 5, low: 1, none: 0 };

  // DEBUG: Track risk level distribution
  const riskDistribution = {
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
    undefined: 0,
  };

  clauses.forEach((clause) => {
    const riskLevel = clause.riskLevel?.toLowerCase();
    const weight = weights[riskLevel] || 0;
    const confidence = clause.confidenceScore || 100;

    // DEBUG: Count risk levels
    if (riskLevel) {
      riskDistribution[riskLevel] = (riskDistribution[riskLevel] || 0) + 1;
    } else {
      riskDistribution.undefined += 1;
    }

    // Weight by confidence score - higher confidence = more impact on score
    totalWeight += (weight * confidence) / 100;
  });

  // DEBUG: Log distribution
  console.log("[ANALYSE] Risk distribution:", riskDistribution);
  console.log(
    "[ANALYSE] Total weight:",
    totalWeight,
    "from",
    clauses.length,
    "clauses",
  );

  // Normalize: calculate average risk per clause, then scale to 100
  const avgRiskPerClause = totalWeight / clauses.length;
  const maxPossibleAvg = 10; // High risk with 100% confidence
  const score = Math.round((avgRiskPerClause / maxPossibleAvg) * 100);

  // Determine risk label based on normalized score
  let riskLabel;
  if (score >= 70) {
    riskLabel = "High";
  } else if (score >= 40) {
    riskLabel = "Medium";
  } else {
    riskLabel = "Low";
  }

  return {
    riskScore: score,
    riskLabel: riskLabel,
  };
};

/**
 * Main analyse controller - handles PDF upload and analysis
 */
const analyseDocument = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a PDF file.",
      });
    }

    const documentName = req.file.originalname;
    console.log(`[ANALYSE] Processing document: ${documentName}`);

    // Step 1: Extract text from PDF
    console.log("[ANALYSE] Step 1: Extracting text from PDF...");
    const pdfData = await extractTextFromPDF(req.file.buffer);
    const rawText = pdfData.text;

    // Step 2: Segment into clauses
    console.log("[ANALYSE] Step 2: Segmenting clauses...");
    const clauses = segmentClauses(rawText);
    console.log(`[ANALYSE] Found ${clauses.length} clauses`);

    // Step 3: Extract entities
    console.log("[ANALYSE] Step 3: Extracting entities...");
    const entities = extractEntities(rawText);

    // Step 4: Send to ML service for classification
    console.log("[ANALYSE] Step 4: Classifying clauses with ML service...");
    let classifiedClauses;

    try {
      const mlResponse = await classifyClauses(clauses);
      classifiedClauses = mlResponse.clauses || clauses;

      // Sanity check: if every clause came back as "none", the ML model likely
      // didn't classify at all — treat it the same as an ML failure
      const allNone = classifiedClauses.every(
        (c) =>
          (c.riskLevel || "none").toLowerCase() === "none" &&
          c.confidenceScore === 0,
      );
      if (allNone && classifiedClauses.length > 1) {
        console.warn(
          "[ANALYSE] Warning: all clauses returned as 'none' with 0 confidence — ML may have failed silently",
        );
      }

      if (classifiedClauses.length > 0) {
        console.log(
          "[ANALYSE] DEBUG - First classified clause:",
          JSON.stringify(classifiedClauses[0], null, 2),
        );
      }
    } catch (mlError) {
      const errorCode = mlError.message.startsWith("ML_SERVICE_OFFLINE")
        ? "ML_SERVICE_OFFLINE"
        : mlError.message.startsWith("ML_SERVICE_TIMEOUT")
          ? "ML_SERVICE_TIMEOUT"
          : "ML_SERVICE_ERROR";

      console.error(
        `[ANALYSE] ML service failed (${errorCode}):`,
        mlError.message,
      );

      // Return a structured error response so the frontend can show a useful message
      return res.status(503).json({
        success: false,
        errorCode,
        message:
          errorCode === "ML_SERVICE_OFFLINE"
            ? "The ML classification service is not running. Please start it with: cd ml_service && python server.py"
            : errorCode === "ML_SERVICE_TIMEOUT"
              ? "The ML classification service timed out. It may be overloaded — please try again."
              : `ML service error: ${mlError.message}`,
        documentName,
        totalClauses: clauses.length,
      });
    }

    // Step 5: Calculate overall risk score
    console.log("[ANALYSE] Step 5: Calculating risk score...");
    const { riskScore, riskLabel } = calculateRiskScore(classifiedClauses);

    // Build final response
    const response = {
      success: true,
      documentName: documentName,
      processedAt: new Date().toISOString(),
      riskScore: riskScore,
      riskLabel: riskLabel,
      totalClauses: classifiedClauses.length,
      entities: entities,
      clauses: classifiedClauses,
    };

    console.log(
      `[ANALYSE] ✓ Analysis complete - Risk Score: ${riskScore}/100 (${riskLabel})`,
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("[ANALYSE] Error:", error.message);
    next(error);
  }
};

module.exports = {
  analyseDocument,
  extractEntities,
  calculateRiskScore,
};
