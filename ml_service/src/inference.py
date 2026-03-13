"""
LexiRisk - Inference Module
===========================
This module handles model loading and prediction for the LexiRisk engine.
It combines the risk classifier and summarizer to provide complete analysis.

This is the main interface that the production backend will use.

Usage:
    from src.inference import LexiRiskEngine
    
    engine = LexiRiskEngine()
    result = engine.analyze("Your legal clause text here")
"""

import os
import joblib
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass

# Import our modules
from src.summarizer import summarize_text, check_model_available


# ============================================================================
# Configuration
# ============================================================================

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(_THIS_DIR, "..", "models")
PIPELINE_PATH = os.path.join(MODEL_DIR, "classification_pipeline.pkl")

# Risk level descriptions for context
RISK_DESCRIPTIONS = {
    "High": "This clause contains terms that may impose significant legal or business obligations. Review carefully with legal counsel.",
    "Medium": "This clause contains terms with moderate business impact. Standard review recommended.",
    "Low": "This is a standard boilerplate clause with minimal risk implications."
}


@dataclass
class AnalysisResult:
    """
    Data class to hold the complete analysis result for a legal clause.
    """
    clause_text: str
    risk_level: str
    confidence: float
    confidence_scores: Dict[str, float]
    summary: str
    risk_description: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "clause_text": self.clause_text,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "confidence_scores": self.confidence_scores,
            "summary": self.summary,
            "risk_description": self.risk_description
        }


class LexiRiskEngine:
    """
    Main inference engine for LexiRisk legal document analysis.
    
    This class provides a unified interface for:
    - Risk level classification
    - Confidence scoring
    - Text summarization
    
    Example:
        engine = LexiRiskEngine()
        result = engine.analyze("The Employee agrees not to compete...")
        print(f"Risk Level: {result.risk_level}")
        print(f"Confidence: {result.confidence:.2%}")
        print(f"Summary: {result.summary}")
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the LexiRisk engine.
        
        Args:
            model_path: Optional custom path to the trained pipeline
        """
        self.model_path = model_path or PIPELINE_PATH
        self.pipeline = None
        self.is_loaded = False
        self._summarizer_available = None
    
    def load_model(self) -> bool:
        """
        Load the trained classification model.
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        if self.is_loaded:
            return True
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model not found at '{self.model_path}'.\n"
                "Please train the model first by running:\n"
                "  1. python data_generator.py\n"
                "  2. python -m src.train"
            )
        
        try:
            self.pipeline = joblib.load(self.model_path)
            self.is_loaded = True
            print(f"✓ Classification model loaded from: {self.model_path}")
            return True
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")
    
    def _ensure_loaded(self):
        """Ensure model is loaded before making predictions."""
        if not self.is_loaded:
            self.load_model()
    
    def predict_risk(self, clause_text: str) -> Tuple[str, float, Dict[str, float]]:
        """
        Predict the risk level for a legal clause.
        
        Args:
            clause_text: The text of the legal clause
            
        Returns:
            Tuple of (risk_level, confidence, all_confidence_scores)
        """
        self._ensure_loaded()
        
        # Get prediction and probabilities
        prediction = self.pipeline.predict([clause_text])[0]
        probabilities = self.pipeline.predict_proba([clause_text])[0]
        
        # Map probabilities to class labels
        classes = self.pipeline.classes_
        confidence_scores = {
            cls: round(prob, 4) 
            for cls, prob in zip(classes, probabilities)
        }
        
        # Get confidence for predicted class
        confidence = confidence_scores[prediction]
        
        return prediction, confidence, confidence_scores
    
    def summarize(self, clause_text: str) -> str:
        """
        Generate a summary of the legal clause.
        
        Args:
            clause_text: The text to summarize
            
        Returns:
            Summary string
        """
        try:
            return summarize_text(clause_text)
        except Exception as e:
            return f"Summarization unavailable: {e}"
    
    def analyze(self, clause_text: str, include_summary: bool = True) -> AnalysisResult:
        """
        Perform complete analysis of a legal clause.
        
        Args:
            clause_text: The legal clause text to analyze
            include_summary: Whether to include BART summarization
            
        Returns:
            AnalysisResult with risk level, confidence, and summary
        """
        # Clean input
        clause_text = clause_text.strip()
        
        if not clause_text:
            return AnalysisResult(
                clause_text="",
                risk_level="Unknown",
                confidence=0.0,
                confidence_scores={},
                summary="No text provided.",
                risk_description="Please provide clause text for analysis."
            )
        
        # Get risk prediction
        risk_level, confidence, confidence_scores = self.predict_risk(clause_text)
        
        # Get summary if requested
        if include_summary:
            summary = self.summarize(clause_text)
        else:
            summary = "Summarization skipped."
        
        # Get risk description
        risk_description = RISK_DESCRIPTIONS.get(
            risk_level, 
            "Risk level could not be determined."
        )
        
        return AnalysisResult(
            clause_text=clause_text,
            risk_level=risk_level,
            confidence=confidence,
            confidence_scores=confidence_scores,
            summary=summary,
            risk_description=risk_description
        )
    
    def batch_analyze(
        self, 
        clauses: list, 
        include_summary: bool = False
    ) -> list:
        """
        Analyze multiple clauses in batch.
        
        Args:
            clauses: List of clause texts
            include_summary: Whether to include summaries (slower)
            
        Returns:
            List of AnalysisResult objects
        """
        return [
            self.analyze(clause, include_summary=include_summary)
            for clause in clauses
        ]
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model.
        
        Returns:
            Dictionary with model metadata
        """
        self._ensure_loaded()
        
        info = {
            "model_path": self.model_path,
            "classes": list(self.pipeline.classes_),
            "vectorizer_features": len(self.pipeline.named_steps["tfidf"].vocabulary_),
        }
        
        # Try to load metadata if available
        metadata_path = os.path.join(MODEL_DIR, "model_metadata.pkl")
        if os.path.exists(metadata_path):
            metadata = joblib.load(metadata_path)
            info["trained_at"] = metadata.get("trained_at", "Unknown")
        
        return info
    
    def is_summarizer_available(self) -> bool:
        """
        Check if the summarization model is available.
        
        Returns:
            True if summarizer can be used, False otherwise
        """
        if self._summarizer_available is None:
            self._summarizer_available = check_model_available()
        return self._summarizer_available


def check_models_exist() -> Dict[str, bool]:
    """
    Check which model files exist.
    
    Returns:
        Dictionary mapping model names to existence status
    """
    models = {
        "classification_pipeline": os.path.exists(PIPELINE_PATH),
        "vectorizer": os.path.exists(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")),
        "classifier": os.path.exists(os.path.join(MODEL_DIR, "risk_classifier.pkl")),
        "metadata": os.path.exists(os.path.join(MODEL_DIR, "model_metadata.pkl")),
    }
    return models


def quick_predict(clause_text: str) -> Dict[str, Any]:
    """
    Quick prediction function for one-off analyses.
    
    Args:
        clause_text: The clause to analyze
        
    Returns:
        Dictionary with analysis results
    """
    engine = LexiRiskEngine()
    result = engine.analyze(clause_text)
    return result.to_dict()


if __name__ == "__main__":
    # Test the inference module
    print("=" * 60)
    print("LexiRisk - Inference Module Test")
    print("=" * 60)
    print()
    
    # Check if models exist
    print("Checking model files...")
    models = check_models_exist()
    for name, exists in models.items():
        status = "✓" if exists else "✗"
        print(f"  {status} {name}")
    
    if not models["classification_pipeline"]:
        print("\n⚠ Classification model not found!")
        print("Please run the following commands first:")
        print("  1. python data_generator.py")
        print("  2. python -m src.train")
        exit(1)
    
    print()
    
    # Test prediction
    test_clause = """
    The Contractor agrees not to directly or indirectly compete with the Company 
    in any manner during the term of this Agreement and for a period of three (3) 
    years following termination. This includes engaging in any business that 
    provides similar services within a 100-mile radius of any Company location.
    """
    
    print("Test Clause:")
    print("-" * 60)
    print(test_clause.strip())
    print()
    
    try:
        engine = LexiRiskEngine()
        result = engine.analyze(test_clause)
        
        print("Analysis Result:")
        print("-" * 60)
        print(f"Risk Level: {result.risk_level}")
        print(f"Confidence: {result.confidence:.2%}")
        print()
        print("Confidence Scores:")
        for level, score in result.confidence_scores.items():
            bar = "█" * int(score * 20)
            print(f"  {level:>8}: {score:.2%} {bar}")
        print()
        print(f"Summary: {result.summary}")
        print()
        print(f"Description: {result.risk_description}")
        
    except Exception as e:
        print(f"Error during analysis: {e}")
