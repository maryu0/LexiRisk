"""
LexiRisk - Source Package
=========================
ML components for legal document risk analysis.

Modules:
- preprocess: Data preprocessing and risk level mapping
- train: Model training (TF-IDF + Logistic Regression)
- summarizer: BART-based text summarization
- inference: Main inference engine for predictions
"""

from src.inference import LexiRiskEngine, AnalysisResult
from src.summarizer import summarize_text

__all__ = [
    "LexiRiskEngine",
    "AnalysisResult", 
    "summarize_text"
]

__version__ = "1.0.0"
