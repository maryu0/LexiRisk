/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging (don't expose to client)
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.message === "Only PDF files are allowed") {
    statusCode = 415;
    message = "Invalid file type. Only PDF files are accepted.";
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File too large. Maximum file size is 10MB.";
  }

  if (err.message.includes("ML service")) {
    statusCode = 503;
    message = "ML service is currently unavailable. Please try again later.";
  }

  if (
    err.message.includes("PDF unreadable") ||
    err.message.includes("password")
  ) {
    statusCode = 422;
    message =
      "Unable to read PDF. File may be corrupted or password protected.";
  }

  if (err.message.includes("timeout")) {
    statusCode = 504;
    message = "Request timeout. The document is taking too long to process.";
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
};

module.exports = errorHandler;
