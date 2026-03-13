/**
 * Service for segmenting legal documents into individual clauses
 */

/**
 * Segment raw document text into individual clauses
 * @param {string} rawText - The extracted text from PDF
 * @returns {Array} - Array of clause objects
 */
const segmentClauses = (rawText) => {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Cannot segment empty text");
  }

  const clauses = [];

  // Regex patterns for detecting clause boundaries
  const clausePatterns = [
    /(?:^|\n)\s*(\d+)\.\s+([A-Z][^\n.]{0,100}?)\.\s*\n/g, // "1. Title."
    /(?:^|\n)\s*(\d+)\.\s+([A-Z][^\n]{0,100}?)\n/g, // "1. Title"
    /(?:^|\n)\s*Section\s+(\d+)[:\s]+([^\n]+)\n/gi, // "Section 1: Title"
    /(?:^|\n)\s*Article\s+(\d+)[:\s]+([^\n]+)\n/gi, // "Article 1: Title"
    /(?:^|\n)\s*Clause\s+(\d+)[:\s]+([^\n]+)\n/gi, // "Clause 1: Title"
  ];

  // Try to find clause boundaries
  let matches = [];
  clausePatterns.forEach((pattern) => {
    const found = [...rawText.matchAll(pattern)];
    matches = matches.concat(
      found.map((m) => ({
        index: m.index,
        clauseNumber: m[1],
        clauseTitle: m[2] ? m[2].trim() : "",
        fullMatch: m[0],
      })),
    );
  });

  // Sort matches by their position in the text
  matches.sort((a, b) => a.index - b.index);

  // If no structured clauses found, create a single clause
  if (matches.length === 0) {
    return [
      {
        clauseNumber: 1,
        clauseTitle: "Document Content",
        clauseText: rawText.trim().substring(0, 2000), // Limit to 2000 chars
      },
    ];
  }

  // Extract text between clause boundaries
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];

    const startIndex = currentMatch.index + currentMatch.fullMatch.length;
    const endIndex = nextMatch ? nextMatch.index : rawText.length;

    let clauseText = rawText.substring(startIndex, endIndex).trim();

    // Remove excessive whitespace
    clauseText = clauseText.replace(/\s+/g, " ").trim();

    // Skip very short clauses (under 20 words)
    const wordCount = clauseText.split(/\s+/).length;
    if (wordCount < 20 && i < matches.length - 1) {
      // Merge with next clause
      continue;
    }

    // Limit clause text length to prevent overly long clauses
    if (clauseText.length > 2000) {
      clauseText = clauseText.substring(0, 2000) + "...";
    }

    clauses.push({
      clauseNumber: parseInt(currentMatch.clauseNumber),
      clauseTitle:
        currentMatch.clauseTitle || `Clause ${currentMatch.clauseNumber}`,
      clauseText: clauseText,
    });
  }

  // If no valid clauses were created, return the full text as one clause
  if (clauses.length === 0) {
    return [
      {
        clauseNumber: 1,
        clauseTitle: "Document Content",
        clauseText: rawText.trim().substring(0, 2000),
      },
    ];
  }

  return clauses;
};

module.exports = {
  segmentClauses,
};
