# 🚀 LexiRisk - Quick Start Guide

## ✅ Integration Complete!

All three services (Frontend, Backend, ML Service) are now fully connected and communicating with each other.

## 🎯 What Was Done

### 1. Created FastAPI Server for ML Service

- ✅ **File:** `ml_service/server.py`
- ✅ REST API with `/api/classify` endpoint
- ✅ Accepts clauses from backend
- ✅ Returns risk classifications and summaries
- ✅ CORS enabled for all services
- ✅ Interactive API docs at `/docs`

### 2. Updated ML Dependencies

- ✅ **File:** `ml_service/requirements.txt`
- ✅ Added FastAPI and Uvicorn for production API
- ✅ Added Pydantic for request/response validation
- ✅ All ML dependencies (scikit-learn, transformers, BART)

### 3. Enhanced Frontend with Upload & API Integration

- ✅ **New Component:** `FileUpload.tsx` - Drag & drop PDF upload
- ✅ **New Service:** `api.ts` - Backend communication layer
- ✅ **Updated:** `App.tsx` - State management and conditional rendering
- ✅ **Config:** `.env` - API URL configuration
- ✅ Shows upload screen, processes documents, displays results

### 4. Backend Configuration

- ✅ **Updated:** `backend/.env` - CORS for both Vite (5173) and React (3000)
- ✅ Already configured to connect to ML service at port 8000
- ✅ Handles PDF upload, clause segmentation, entity extraction

### 5. Automation & Documentation

- ✅ **Script:** `start-all.ps1` - Launch all services in one command
- ✅ **Docs:** `README.md` - Comprehensive project documentation
- ✅ **Guide:** This quick start file

### 6. ML Model Training

- ✅ Generated 42 synthetic legal clauses
- ✅ Trained TF-IDF + Logistic Regression classifier
- ✅ Model accuracy: 66.67% on test set
- ✅ Models saved to `ml_service/models/`

## 🌐 Current Service Status

All services are currently **RUNNING**:

| Service         | URL                        | Status               |
| --------------- | -------------------------- | -------------------- |
| **Frontend**    | http://localhost:5174      | ✅ Running (Vite)    |
| **Backend**     | http://localhost:5000      | ✅ Running (Express) |
| **ML Service**  | http://localhost:8000      | ✅ Running (FastAPI) |
| **ML API Docs** | http://localhost:8000/docs | ✅ Available         |

## 🎨 How to Use

### Option 1: Use Running Services (NOW)

1. **Open your browser** to: http://localhost:5174

2. **Upload a PDF document** or click "View a sample document"

3. **View the analysis:**
   - Overall risk score and level
   - Individual clause classifications
   - Plain English summaries (powered by BART AI)
   - Entity extraction (parties, dates, terms, etc.)

### Option 2: Restart Everything Fresh

```powershell
# Stop all running services (close terminal windows)

# From the root directory, run:
.\start-all.ps1
```

This will open 3 separate terminal windows:

- ML Service (Port 8000)
- Backend (Port 5000)
- Frontend (Port 5173 or 5174)

## 📋 Data Flow

```
User uploads PDF
       ↓
Frontend (React)
       ↓
Backend (Node.js)
       ├─→ Extracts text from PDF
       ├─→ Segments into clauses
       ├─→ Extracts entities (parties, dates, etc.)
       ↓
ML Service (FastAPI/Python)
       ├─→ Classifies risk level (High/Medium/Low)
       ├─→ Calculates confidence scores
       ├─→ Generates plain English summaries (BART)
       ↓
Backend aggregates results
       ↓
Frontend displays analysis
```

## 🧪 Testing the Integration

### Test 1: Health Checks

```powershell
# Backend
curl http://localhost:5000/api/health

# ML Service
curl http://localhost:8000/api/health
```

### Test 2: ML Service Directly

1. Go to http://localhost:8000/docs
2. Try the POST `/api/classify` endpoint
3. Use this test data:

```json
{
  "clauses": [
    {
      "clauseNumber": 1,
      "clauseTitle": "Non-Compete",
      "clauseText": "The Employee agrees not to engage in any competitive business activities within a 50-mile radius for a period of 2 years following termination."
    }
  ]
}
```

### Test 3: End-to-End (Recommended)

1. Open http://localhost:5174
2. Click "View a sample document" (no upload needed)
3. Verify you see:
   - Risk score (78/100)
   - Risk level badges (High/Medium/Low)
   - Clause summaries
   - Entity information

## 🔧 Configuration Files

### Frontend Environment (frontend/.env)

```env
VITE_API_URL=http://localhost:5000
```

### Backend Environment (backend/.env)

```env
PORT=5000
ML_SERVICE_URL=http://localhost:8000/api/classify
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

## 📦 Project Structure

```
legalizer/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx  ← NEW: PDF upload component
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── AnalysisPanel.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.ts          ← NEW: Backend API integration
│   │   └── App.tsx             ← UPDATED: State management
│   └── .env                    ← NEW: API configuration
│
├── backend/                     # Node.js + Express
│   ├── controllers/
│   │   ├── analyseController.js
│   │   └── reportController.js
│   ├── services/
│   │   ├── mlService.js        # Calls ML service
│   │   ├── pdfExtractor.js
│   │   └── clauseSegmentor.js
│   ├── server.js
│   └── .env                    ← UPDATED: CORS config
│
├── ml_service/                  # Python + FastAPI
│   ├── server.py               ← NEW: Production API server
│   ├── app.py                  # Streamlit testing UI
│   ├── src/
│   │   ├── inference.py        # ML engine
│   │   ├── train.py           # Model training
│   │   └── summarizer.py      # BART summarization
│   ├── models/                # ← Trained models saved here
│   ├── requirements.txt       ← UPDATED: Added FastAPI
│   └── data_generator.py
│
├── start-all.ps1              ← NEW: Launch all services
└── README.md                  ← NEW: Full documentation
```

## 🎯 Key Features Enabled

### Frontend Features

- ✅ Drag & drop PDF upload
- ✅ Loading states and error handling
- ✅ Sample document preview
- ✅ Real-time communication with backend
- ✅ Dynamic risk visualization

### Backend Features

- ✅ PDF text extraction
- ✅ Clause segmentation
- ✅ Entity extraction (regex-based)
- ✅ ML service integration
- ✅ Fallback mode if ML service is down
- ✅ PDF report generation

### ML Service Features

- ✅ Risk classification (High/Medium/Low)
- ✅ Confidence scoring (0-100%)
- ✅ Plain English summaries (BART model)
- ✅ RESTful API with FastAPI
- ✅ Interactive API documentation
- ✅ Model caching for performance

## 🐛 Troubleshooting

### Issue: Frontend shows connection error

**Solution:** Ensure backend is running at http://localhost:5000

```powershell
cd backend
npm start
```

### Issue: ML classifications show "none" or error

**Solution:** Ensure ML service is running at http://localhost:8000

```powershell
cd ml_service
python server.py
```

### Issue: Port already in use

**Solution:** Kill the process or change the port

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /PID <process_id> /F
```

### Issue: ML model not found

**Solution:** Train the model

```powershell
cd ml_service
python data_generator.py
python -m src.train
```

## 📚 Next Steps

### Improve ML Model

```bash
# Add more training data
# Edit: ml_service/data_generator.py
# Add more clause templates

# Retrain
python data_generator.py
python -m src.train
```

### Customize Entity Extraction

```bash
# Edit regex patterns
# File: backend/controllers/analyseController.js
# Function: extractEntities()
```

### Deploy to Production

- Set `NODE_ENV=production` in backend
- Use gunicorn or similar for ML service
- Build frontend with `npm run build`
- Configure proper CORS origins
- Set up reverse proxy (nginx)

## 🎉 Success!

You now have a fully integrated legal document risk analysis system with:

- Modern React frontend with drag & drop uploads
- Node.js backend for document processing
- Python ML service with AI-powered classification and summarization
- All services communicating seamlessly

**Start analyzing legal documents now at:** http://localhost:5174

---

**Questions or issues?** Check the main [README.md](README.md) for detailed documentation.
