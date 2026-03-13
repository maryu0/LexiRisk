const multer = require("multer");
const path = require("path");

/**
 * Configure Multer for PDF file uploads
 * - Store files in memory as buffers (no disk storage)
 - Max file size: 10MB
 * - Only accept PDF files
 */

// Configure memory storage (no disk writes)
const storage = multer.memoryStorage();

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && fileExtension === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter,
});

module.exports = upload;
