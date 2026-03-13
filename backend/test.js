// Test script for LexiRisk backend endpoints

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const BASE_URL = "http://localhost:5000";

// Test 1: Health Check
async function testHealthCheck() {
  console.log("\n=== Test 1: Health Check ===");
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log("✓ Health check passed");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error("✗ Health check failed:", error.message);
    return false;
  }
}

// Test 2: Document Analysis (requires a PDF file)
async function testDocumentAnalysis(pdfPath) {
  console.log("\n=== Test 2: Document Analysis ===");

  if (!fs.existsSync(pdfPath)) {
    console.log("⚠ Skipping - PDF file not found:", pdfPath);
    return false;
  }

  try {
    const form = new FormData();
    form.append("document", fs.createReadStream(pdfPath));

    const response = await axios.post(`${BASE_URL}/api/analyse`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log("✓ Document analysis completed");
    console.log("Document:", response.data.documentName);
    console.log("Risk Score:", response.data.riskScore);
    console.log("Risk Label:", response.data.riskLabel);
    console.log("Total Clauses:", response.data.totalClauses);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("✗ Analysis failed:", error.response.data.message);
    } else {
      console.error("✗ Analysis failed:", error.message);
    }
    return false;
  }
}

// Test 3: Report Generation
async function testReportGeneration(analysisResult) {
  console.log("\n=== Test 3: Report Generation ===");

  if (!analysisResult) {
    console.log("⚠ Skipping - No analysis result available");
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/report`,
      analysisResult,
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Save the PDF to disk
    const outputPath = "./test_report.pdf";
    fs.writeFileSync(outputPath, response.data);

    console.log("✓ Report generated successfully");
    console.log("Saved to:", outputPath);
    return true;
  } catch (error) {
    if (error.response) {
      console.error("✗ Report generation failed");
    } else {
      console.error("✗ Report generation failed:", error.message);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  LexiRisk Backend API Test Suite      ║");
  console.log("╚════════════════════════════════════════╝");

  // Test 1: Health Check
  await testHealthCheck();

  // Test 2: Document Analysis (provide a path to a test PDF)
  const testPdfPath = "./test_documents/sample.pdf";
  const analysisResult = await testDocumentAnalysis(testPdfPath);

  // Test 3: Report Generation
  if (analysisResult) {
    await testReportGeneration(analysisResult);
  }

  console.log("\n=== Tests Complete ===\n");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testDocumentAnalysis,
  testReportGeneration,
};
