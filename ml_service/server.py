"""
LexiRisk - FastAPI Production Server
====================================
This is the production API server that integrates with the Node.js backend.
It exposes a REST API for legal clause risk classification and summarization.

Endpoints:
    POST /api/classify      - Classify ALL clauses in a document
    POST /api/classify/test - Classify a SINGLE clause (smoke-test)
    GET  /api/health        - Health check

Usage:
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import sys
import time
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Add src to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.inference import LexiRiskEngine, check_models_exist

# ============================================================================
# FastAPI App Configuration
# ============================================================================

app = FastAPI(
    title="LexiRisk ML Service",
    description="Machine Learning service for legal document risk analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow requests from frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React frontend
        "http://localhost:5173",  # Vite frontend
        "http://localhost:5000",  # Node.js backend
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Request/Response Models
# ============================================================================

class ClauseInput(BaseModel):
    """Input model for a single clause."""
    clauseNumber: int = Field(..., description="Clause number/index")
    clauseTitle: str = Field(..., description="Title or heading of the clause")
    clauseText: str = Field(..., description="Full text content of the clause")
    
    class Config:
        json_schema_extra = {
            "example": {
                "clauseNumber": 1,
                "clauseTitle": "Non-Compete",
                "clauseText": "The Employee agrees not to engage in any competitive business activities..."
            }
        }


class ClauseOutput(BaseModel):
    """Output model for a classified clause."""
    clauseNumber: int
    clauseTitle: str
    clauseText: str
    riskLevel: str = Field(..., description="Risk level: High, Medium, or Low")
    confidenceScore: float = Field(..., description="Confidence score as percentage (0-100)")
    plainEnglishSummary: str = Field(..., description="Plain English summary of the clause")
    
    class Config:
        json_schema_extra = {
            "example": {
                "clauseNumber": 1,
                "clauseTitle": "Non-Compete",
                "clauseText": "The Employee agrees not to engage...",
                "riskLevel": "High",
                "confidenceScore": 92.5,
                "plainEnglishSummary": "This clause restricts competitive activities..."
            }
        }


class ClassifyRequest(BaseModel):
    """Request body for clause classification."""
    clauses: List[ClauseInput] = Field(..., min_items=1, description="List of clauses to classify")
    
    class Config:
        json_schema_extra = {
            "example": {
                "clauses": [
                    {
                        "clauseNumber": 1,
                        "clauseTitle": "Non-Compete",
                        "clauseText": "The Employee agrees not to engage in any competitive business activities within a 50-mile radius for a period of 2 years following termination."
                    }
                ]
            }
        }


class ClassifyResponse(BaseModel):
    """Response body for clause classification."""
    success: bool = True
    processedAt: str = Field(..., description="ISO timestamp of processing")
    totalClauses: int = Field(..., description="Number of clauses processed")
    clauses: List[ClauseOutput] = Field(..., description="Classified clauses with risk analysis")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    message: str
    timestamp: str
    models_loaded: bool
    version: str


# ============================================================================
# Global Engine Instance
# ============================================================================

# Initialize the ML engine globally to avoid reloading models on each request
engine = None
engine_error = None

try:
    print("🔄 Loading LexiRisk ML Engine...")
    engine = LexiRiskEngine()
    engine.load_model()
    print("✅ LexiRisk ML Engine loaded successfully")
except Exception as e:
    engine_error = str(e)
    print(f"❌ Failed to load ML Engine: {e}")


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information."""
    return {
        "service": "LexiRisk ML Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "classify": "/api/classify",
            "docs": "/docs"
        }
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify service status and model availability.
    """
    models = check_models_exist()
    
    return HealthResponse(
        status="healthy" if engine is not None else "unhealthy",
        message="ML service is running" if engine is not None else f"ML models not loaded: {engine_error}",
        timestamp=datetime.utcnow().isoformat(),
        models_loaded=models["classification_pipeline"],
        version="1.0.0"
    )


@app.post("/api/classify", response_model=ClassifyResponse, tags=["Classification"])
async def classify_clauses(request: ClassifyRequest):
    """
    Classify legal clauses and generate risk analysis.
    
    This endpoint:
    1. Accepts a list of legal clauses
    2. Classifies each clause's risk level (High/Medium/Low)
    3. Provides confidence scores
    4. Generates plain English summaries
    
    Args:
        request: ClassifyRequest with list of clauses
        
    Returns:
        ClassifyResponse with classified clauses and risk analysis
        
    Raises:
        HTTPException: If models are not loaded or processing fails
    """
    # Check if engine is loaded
    if engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "ML models not loaded",
                "message": engine_error or "Models not initialized",
                "instructions": [
                    "1. Generate training data: python data_generator.py",
                    "2. Train the model: python -m src.train",
                    "3. Restart the server"
                ]
            }
        )
    
    try:
        batch_start = time.time()
        print(f"\n📥 Received classification request for {len(request.clauses)} clauses")

        classified_clauses = []

        # Process each clause
        for clause in request.clauses:
            clause_start = time.time()
            print(f"   Processing clause #{clause.clauseNumber}: {clause.clauseTitle[:50]}")

            try:
                result = engine.analyze(
                    clause_text=clause.clauseText,
                    include_summary=True,
                )
            except Exception as clause_err:
                print(f"   ❌ Error on clause #{clause.clauseNumber}: {clause_err}")
                raise

            confidence_percentage = round(result.confidence * 100, 2)
            elapsed = round(time.time() - clause_start, 2)

            classified_clause = ClauseOutput(
                clauseNumber=clause.clauseNumber,
                clauseTitle=clause.clauseTitle,
                clauseText=clause.clauseText,
                riskLevel=result.risk_level,
                confidenceScore=confidence_percentage,
                plainEnglishSummary=result.summary,
            )

            classified_clauses.append(classified_clause)
            print(f"   ✓ Clause #{clause.clauseNumber} → {result.risk_level} ({confidence_percentage:.1f}%) in {elapsed}s")

        total_elapsed = round(time.time() - batch_start, 2)
        print(f"✅ Classified {len(classified_clauses)} clauses in {total_elapsed}s total")

        return ClassifyResponse(
            success=True,
            processedAt=datetime.utcnow().isoformat(),
            totalClauses=len(classified_clauses),
            clauses=classified_clauses,
        )

    except Exception as e:
        print(f"❌ Classification error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Classification failed", "message": str(e)},
        )


# ============================================================================
# Test endpoint — single clause smoke test
# ============================================================================

class TestClassifyRequest(BaseModel):
    """Minimal request for single-clause smoke test."""
    clauseText: str = Field(..., description="Single clause text to classify")
    clauseTitle: str = Field(default="Test Clause", description="Optional title")


@app.post("/api/classify/test", tags=["Classification"])
async def classify_test(request: TestClassifyRequest):
    """
    Smoke-test endpoint: classify a single clause and return immediately.
    Use this to verify the ML model and summarizer are working before
    sending a full document.
    """
    if engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "ML models not loaded", "message": engine_error},
        )
    try:
        start = time.time()
        result = engine.analyze(clause_text=request.clauseText, include_summary=True)
        elapsed = round(time.time() - start, 3)
        return {
            "success": True,
            "clauseTitle": request.clauseTitle,
            "riskLevel": result.risk_level,
            "confidence": round(result.confidence * 100, 2),
            "summary": result.summary,
            "processingTimeSeconds": elapsed,
            "modelsLoaded": True,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Test classification failed", "message": str(e)},
        )


# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    print("\n" + "="*60)
    print("⚖️  LexiRisk ML Service - FastAPI Server")
    print("="*60)
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔧 Environment: {os.getenv('ENV', 'development')}")

    if engine is not None:
        print("✅ ML Engine: Loaded and Ready")
        try:
            info = engine.get_model_info()
            print(f"   • Classes: {', '.join(info['classes'])}")
            print(f"   • Features: {info['vectorizer_features']:,}")
        except Exception:
            pass
    else:
        print("⚠️  ML Engine: Not Loaded")
        print(f"   Error: {engine_error}")

    print("\n📡 API Endpoints:")
    print("   • Health:        http://localhost:8000/api/health")
    print("   • Classify:      http://localhost:8000/api/classify")
    print("   • Classify Test: http://localhost:8000/api/classify/test")
    print("   • Docs:          http://localhost:8000/docs")
    print("="*60 + "\n")


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    # Run with uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (development only)
        log_level="info"
    )
