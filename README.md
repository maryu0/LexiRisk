# LexiRisk - AI-Powered Legal Document Risk Analysis

<div align="center">

⚖️ **Analyze legal contracts • Identify risks • Get plain English summaries**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](#documentation)

</div>

---

## 🎯 Features

- **PDF Upload & Processing** - Extract text from legal PDF documents
- **Intelligent Clause Segmentation** - Automatically identify and separate contract clauses
- **AI Risk Classification** - ML-powered risk analysis (High/Medium/Low)
- **Confidence Scoring** - See how confident the model is in its predictions
- **Plain English Summaries** - BART-generated summaries for complex legal text
- **Entity Extraction** - Automatically identify parties, dates, terms, and more
- **Overall Risk Scoring** - Aggregate risk assessment (0-100 scale)
- **PDF Report Generation** - Professional reports with risk highlights
- **Interactive UI** - Modern React interface with document viewer

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    Frontend     │─────▶│     Backend     │─────▶│   ML Service    │
│  React + Vite   │      │  Node.js/Express│      │  FastAPI/Python │
│   Port: 5173    │      │   Port: 5000    │      │   Port: 8000    │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ▲                        │                          │
        │                        │                          │
        └────────────────────────┴──────────────────────────┘
                            JSON Data Flow
```

### Tech Stack

**Frontend:**

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Lucide Icons

**Backend:**

- Node.js 18+
- Express.js
- Multer (file uploads)
- pdf-parse (PDF extraction)
- PDFKit (report generation)
- Axios (ML service communication)

**ML Service:**

- Python 3.8+
- FastAPI (REST API)
- Scikit-learn (classification)
- Transformers + BART (summarization)
- TF-IDF + Logistic Regression

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd legalizer
```

### 2. Setup Backend

```bash
cd backend
npm install
```

The backend is pre-configured with a `.env` file.

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Setup ML Service

```bash
cd ../ml_service

# Install Python dependencies
pip install -r requirements.txt

# Generate training data
python data_generator.py

# Train the model
python -m src.train
```

This will:

- ✅ Install scikit-learn, transformers, FastAPI, etc.
- ✅ Generate ~120 synthetic legal clauses for training
- ✅ Train a TF-IDF + Logistic Regression classifier
- ✅ Save models to `models/` directory

### 5. Start All Services

**Option A: PowerShell Script (Recommended)**

```powershell
# From the root directory
.\start-all.ps1
```

This opens 3 terminal windows for each service.

**Option B: Manual Start**

```bash
# Terminal 1 - ML Service
cd ml_service
python server.py

# Terminal 2 - Backend
cd backend
npm start

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### 6. Access the Application

Open your browser to:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/health
- **ML Service Docs:** http://localhost:8000/docs

## 📖 Usage

1. **Upload a PDF** - Click or drag-and-drop a legal contract PDF
2. **View Analysis** - See risk scores, clause classifications, and summaries
3. **Review Clauses** - Click on any clause to see detailed risk analysis
4. **Download Report** - Generate a professional PDF report (optional)

### Sample Document

Click "View a sample document" on the upload screen to see the interface with pre-loaded data (no backend required).

## 📁 Project Structure

```
legalizer/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API integration
│   │   └── data/          # Sample data
│   ├── package.json
│   └── .env
├── backend/               # Node.js + Express backend
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Upload, error handling
│   ├── server.js
│   ├── package.json
│   └── .env
├── ml_service/            # Python ML service
│   ├── src/
│   │   ├── inference.py   # ML engine
│   │   ├── train.py       # Model training
│   │   ├── preprocess.py  # Data processing
│   │   └── summarizer.py  # BART summarization
│   ├── models/            # Trained models
│   ├── server.py          # FastAPI server
│   ├── app.py             # Streamlit UI (testing)
│   ├── data_generator.py  # Generate training data
│   └── requirements.txt
└── start-all.ps1          # Startup script
```

## 🔌 API Endpoints

### Backend (Port 5000)

```
GET  /api/health          # Health check
POST /api/analyse         # Upload and analyze PDF
POST /api/report          # Generate PDF report
```

### ML Service (Port 8000)

```
GET  /                    # Service info
GET  /api/health          # Health check
POST /api/classify        # Classify clauses
GET  /docs                # Interactive API docs
```

## 🧪 Testing

### Test Backend

```bash
cd backend
node test.js
```

### Test ML Service

**Streamlit UI:**

```bash
cd ml_service
streamlit run app.py
```

Access at http://localhost:8501

**API Testing:**

- Visit http://localhost:8000/docs for interactive Swagger UI
- Test the `/api/classify` endpoint directly

## 🛠️ Development

### Backend Environment Variables

Edit `backend/.env`:

```env
PORT=5000
ML_SERVICE_URL=http://localhost:8000/api/classify
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

### Frontend Environment Variables

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Hot Reload

All three services support hot reload:

- **Frontend:** Vite auto-reloads on file changes
- **Backend:** Use `npm run dev` (nodemon)
- **ML Service:** Server runs with `--reload` flag

## 📊 ML Model Details

### Classification Model

- **Algorithm:** Logistic Regression
- **Features:** TF-IDF (5000 max features, unigrams + bigrams)
- **Classes:** High Risk, Medium Risk, Low Risk
- **Training:** ~120 synthetic clauses (expandable)

### Summarization Model

- **Model:** facebook/bart-large-cnn
- **Framework:** HuggingFace Transformers
- **Purpose:** Generate plain English summaries

### Risk Mapping

| Risk Level | Point Value | Examples                                                |
| ---------- | ----------- | ------------------------------------------------------- |
| High       | 15 points   | Non-compete, Uncapped liability, Exclusive dealing      |
| Medium     | 7 points    | Auto-renewal, Termination for convenience, IP ownership |
| Low        | 2 points    | Standard notices, Counterparts, Entire agreement        |

**Overall Score Range:**

- 0-39: Low Risk
- 40-69: Medium Risk
- 70-100: High Risk

## 🐛 Troubleshooting

### ML Service Won't Start

```bash
# Ensure models are trained
cd ml_service
python data_generator.py
python -m src.train
```

### Backend Can't Connect to ML Service

- Check if ML service is running: http://localhost:8000/api/health
- Verify `ML_SERVICE_URL` in `backend/.env`
- Backend will use fallback mode if ML service is unavailable

### Frontend Can't Connect to Backend

- Check if backend is running: http://localhost:5000/api/health
- Verify `VITE_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### Port Already in Use

```powershell
# Windows - Find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Support

For issues or questions:

- Check the [documentation](#documentation)
- Review existing issues
- Open a new issue with details

---

<div align="center">

**Built with** ❤️ **for legal tech innovation**

⚖️ LexiRisk

</div>
