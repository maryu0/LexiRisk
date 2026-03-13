const pdf = require("pdf-parse");

/**
 * Service for extracting text from PDF files
 */

/**
 * Extract text content from a PDF file buffer
 * @param {Buffer} fileBuffer - The PDF file buffer from multer
 * @returns {Promise<Object>} - Extracted text and metadata
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    // Parse the PDF using pdf-parse
    const data = await pdf(fileBuffer);

    // Check if PDF is empty or has no text
    if (!data.text || data.text.trim().length === 0) {
      throw new Error(
        "PDF appears to be empty or contains no extractable text",
      );
    }

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata,
    };
  } catch (error) {
    // Handle password-protected or corrupted PDFs
    if (
      error.message.includes("password") ||
      error.message.includes("encrypted")
    ) {
      throw new Error("PDF unreadable: File is password protected");
    }

    if (error.message.includes("Invalid PDF")) {
      throw new Error("PDF unreadable: File appears to be corrupted");
    }

    // Re-throw with more context
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
};
