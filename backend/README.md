# LexiRisk Backend

Node.js + Express backend for the LexiRisk legal document risk analysis system. This backend acts as the middle layer between the React frontend and a Python FastAPI ML service.

## 🚀 Features

- **PDF Upload & Processing** - Accept PDF uploads up to 10MB
- **Text Extraction** - Extract text from PDFs using pdf-parse
- **Clause Segmentation** - Intelligently segment legal documents into clauses
- **Entity Extraction** - Regex-based extraction of key legal entities
- **ML Service Integration** - Communicate with FastAPI ML service for classification
- **Risk Scoring** - Calculate overall document risk score (0-100)
- **PDF Report Generation** - Generate downloadable PDF reports with PDFKit
- **Error Handling** - Comprehensive error handling with clear error messages

## 📁 Project Structure

```
backend/
├── server.js                    # Express server entry point
├── .env                         # Environment configuration
├── package.json                 # Dependencies and scripts
├── routes/
│   ├── analyse.js              # POST /api/analyse route
│   └── report.js               # POST /api/report route
├── controllers/
│   ├── analyseController.js    # Document analysis logic
│   └── reportController.js     # Report generation logic
├── middleware/
│   ├── upload.js               # Multer file upload configuration
│   └── errorHandler.js         # Global error handling
└── services/
    ├── pdfExtractor.js         # PDF text extraction
    ├── clauseSegmentor.js      # Clause segmentation logic
    ├── mlService.js            # ML service communication
    └── reportGenerator.js      # PDF report generation
```

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **Axios** - HTTP client for ML service
- **PDFKit** - PDF report generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📦 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# ML Service Configuration
ML_SERVICE_URL=http://localhost:8000/api/classify
ML_SERVICE_TIMEOUT=30000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "message": "LexiRisk backend server is running",
  "timestamp": "2024-03-11T...",
  "environment": "development",
  "services": {
    "server": "online",
    "mlService": "http://localhost:8000/api/classify"
  }
}
```

### Analyse Document

```
POST /api/analyse
Content-Type: multipart/form-data
```

**Request:**

- Field name: `document`
- File type: PDF
- Max size: 10MB

**Response:**

```json
{
  "success": true,
  "documentName": "NDA_Acme_Corp.pdf",
  "processedAt": "2024-03-11T...",
  "riskScore": 78,
  "riskLabel": "High",
  "totalClauses": 8,
  "entities": {
    "parties": { "value": "Acme Corp & TechFlow Inc", "confidence": 97 },
    "effectiveDate": { "value": "October 15, 2023", "confidence": 98 },
    "governingLaw": { "value": "State of Delaware", "confidence": 95 },
    "termLength": { "value": "3 Years", "confidence": 92 },
    "liabilityCap": { "value": "$50,000", "confidence": 88 },
    "autoRenewal": { "value": "Yes, 1 Year terms", "confidence": 90 }
  },
  "clauses": [
    {
      "clauseNumber": 1,
      "clauseTitle": "Definitions",
      "clauseText": "...",
      "riskLevel": "none",
      "confidenceScore": 94,
      "plainEnglishSummary": "..."
    }
  ]
}
```

### Generate Report

```
POST /api/report
Content-Type: application/json
```

**Request Body:**

```json
{
  "documentName": "NDA_Acme_Corp.pdf",
  "riskScore": 78,
  "riskLabel": "High",
  "totalClauses": 8,
  "entities": { ... },
  "clauses": [ ... ]
}
```

**Response:**

- Content-Type: `application/pdf`
- PDF file download

## 🔍 How It Works

### 1. Document Upload

- User uploads PDF via frontend
- Multer validates file type and size
- File stored in memory as buffer

### 2. Text Extraction

- `pdfExtractor.js` uses pdf-parse to extract text
- Handles password-protected and corrupted PDFs
- Returns raw text content

### 3. Clause Segmentation

- `clauseSegmentor.js` detects clause boundaries
- Uses regex patterns for numbered clauses
- Handles edge cases (short clauses, missing titles)

### 4. Entity Extraction

- Regex patterns extract key legal information
- Assigns confidence scores (85-99%)
- Extracts parties, dates, laws, terms, etc.

### 5. ML Classification

- `mlService.js` sends clauses to FastAPI service
- 30-second timeout with fallback
- Returns risk levels and summaries

### 6. Risk Calculation

- Weighted scoring: High (15pts), Medium (7pts), Low (2pts)
- Capped at 100 points
- Risk label: High (70+), Medium (40-70), Low (<40)

### 7. Report Generation

- PDFKit generates professional PDF report
- Includes risk assessment, entities, clause breakdown
- Streamed directly to client (no disk storage)

## 🚨 Error Handling

The backend handles these error scenarios:

| Error                  | Status Code | Description                         |
| ---------------------- | ----------- | ----------------------------------- |
| File too large         | 413         | File exceeds 10MB limit             |
| Wrong file type        | 415         | Non-PDF file uploaded               |
| ML service unavailable | 503         | Cannot connect to ML service        |
| PDF unreadable         | 422         | Corrupted or password-protected PDF |
| Request timeout        | 504         | Processing took too long            |
| Server error           | 500         | Internal server error               |

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

### Test Document Analysis

```bash
curl -X POST http://localhost:5000/api/analyse \
  -F "document=@path/to/test.pdf"
```

### Test Report Generation

```bash
curl -X POST http://localhost:5000/api/report \
  -H "Content-Type: application/json" \
  -d @analysis_result.json \
  --output report.pdf
```

## 📝 Development Notes

### Code Style

- Use `async/await` (no callbacks)
- All routes wrapped in try/catch
- Clear console logging for debugging
- Comments on complex logic

### Adding New Routes

1. Create route file in `routes/`
2. Create controller in `controllers/`
3. Register route in `server.js`
4. Add error handling

### ML Service Integration

- The ML service URL is configurable in `.env`
- If ML service is down, clauses are returned without classification
- Timeout is set to 30 seconds (configurable)

## 🔒 Security Considerations

- File size limited to 10MB
- Only PDF files accepted
- Memory storage (no files saved to disk)
- CORS configured for specific frontend origin
- No sensitive data in error responses
- Stack traces hidden in production

## 📊 Performance

- Concurrent request handling via Express
- Memory-efficient PDF processing
- Streaming PDF reports (no temp files)
- ML service timeout prevents hanging requests

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env
PORT=5001
```

### ML Service Connection Failed

- Check `ML_SERVICE_URL` in `.env`
- Ensure Python FastAPI service is running
- Backend will work with fallback mode if ML service is down

### PDF Upload Fails

- Check file size < 10MB
- Ensure file is valid PDF
- Check multer configuration in `middleware/upload.js`

## 📚 Dependencies

```json
{
  "express": "Web framework",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables",
  "multer": "File uploads",
  "pdf-parse": "PDF text extraction",
  "axios": "HTTP client",
  "pdfkit": "PDF generation",
  "express-validator": "Input validation"
}
```

## 🤝 Integration with Frontend

The frontend should send requests to:

- `POST /api/analyse` - Upload and analyze document
- `POST /api/report` - Generate PDF report

Example frontend fetch:

```javascript
const formData = new FormData();
formData.append("document", pdfFile);

const response = await fetch("http://localhost:5000/api/analyse", {
  method: "POST",
  body: formData,
});

const result = await response.json();
```

## 📄 License

This project is part of the LexiRisk legal document analysis system.

---

Built with ⚖️ by the LexiRisk Team
