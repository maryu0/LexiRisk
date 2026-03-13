"""
LexiRisk - Model Training Module
================================
This module handles training of the risk classification model using:
- TF-IDF Vectorizer for text feature extraction
- Logistic Regression for multi-class classification

The trained model and vectorizer are saved to the models/ directory as .pkl files.

Usage:
    python -m src.train
    
    or from another module:
    from src.train import train_model
"""

import os
import joblib
import numpy as np
from datetime import datetime
from typing import Tuple, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.pipeline import Pipeline

# Import our preprocessing module
from src.preprocess import load_data, preprocess_data, get_train_test_split, get_risk_level_stats


# ============================================================================
# Configuration
# ============================================================================

# Directory to save trained models
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(_THIS_DIR, "..", "models")

# Model file paths
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_classifier.pkl")
PIPELINE_PATH = os.path.join(MODEL_DIR, "classification_pipeline.pkl")

# TF-IDF Configuration
TFIDF_CONFIG = {
    "max_features": 5000,      # Maximum number of features (vocabulary size)
    "ngram_range": (1, 2),     # Use unigrams and bigrams
    "min_df": 1,               # Minimum document frequency
    "max_df": 0.95,            # Maximum document frequency (remove very common terms)
    "stop_words": "english",   # Remove English stop words
    "sublinear_tf": True,      # Apply sublinear TF scaling
}

# Logistic Regression Configuration
LOGREG_CONFIG = {
    "C": 1.0,                  # Regularization strength
    "max_iter": 1000,          # Maximum iterations for convergence
    "class_weight": "balanced", # Handle class imbalance
    "random_state": 42,        # Reproducibility
    "solver": "lbfgs",         # Solver algorithm
}


def create_model_directory():
    """Create the models directory if it doesn't exist."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"✓ Model directory ready: {MODEL_DIR}/")


def create_pipeline() -> Pipeline:
    """
    Create a scikit-learn pipeline with TF-IDF vectorizer and Logistic Regression.
    
    Returns:
        Configured Pipeline object
    """
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(**TFIDF_CONFIG)),
        ("classifier", LogisticRegression(**LOGREG_CONFIG))
    ])
    
    return pipeline


def train_model(
    data_path: str = None,
    test_size: float = 0.2,
    save_models: bool = True
) -> Tuple[Pipeline, dict]:
    """
    Train the risk classification model.
    
    Args:
        data_path: Path to training data CSV
        test_size: Proportion of data to use for testing
        save_models: Whether to save the trained models to disk
        
    Returns:
        Tuple of (trained_pipeline, evaluation_metrics)
    """
    if data_path is None:
        data_path = os.path.join(_THIS_DIR, "..", "data", "training_data.csv")
    print("=" * 60)
    print("LexiRisk - Model Training")
    print("=" * 60)
    print()
    
    # Step 1: Load and preprocess data
    print("Step 1: Loading and preprocessing data...")
    df = load_data(data_path)
    processed_df = preprocess_data(df)
    
    # Show data distribution
    print("\nDataset Statistics:")
    stats = get_risk_level_stats(processed_df)
    for level, info in stats.items():
        print(f"  - {level} Risk: {info['count']} samples ({info['percentage']}%)")
    
    # Step 2: Split data
    print("\nStep 2: Splitting data into train/test sets...")
    train_df, test_df = get_train_test_split(processed_df, test_size=test_size)
    
    X_train = train_df["clause_text"].values
    y_train = train_df["risk_level"].values
    X_test = test_df["clause_text"].values
    y_test = test_df["risk_level"].values
    
    # Step 3: Create and train pipeline
    print("\nStep 3: Training TF-IDF + Logistic Regression model...")
    pipeline = create_pipeline()
    pipeline.fit(X_train, y_train)
    print("✓ Model training complete")
    
    # Step 4: Evaluate model
    print("\nStep 4: Evaluating model performance...")
    metrics = evaluate_model(pipeline, X_test, y_test)
    
    # Step 5: Save models
    if save_models:
        print("\nStep 5: Saving trained models...")
        save_trained_models(pipeline)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    
    return pipeline, metrics


def evaluate_model(pipeline: Pipeline, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """
    Evaluate the trained model on test data.
    
    Args:
        pipeline: Trained pipeline
        X_test: Test features
        y_test: Test labels
        
    Returns:
        Dictionary containing evaluation metrics
    """
    # Make predictions
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n  Accuracy: {accuracy:.2%}")
    print("\n  Classification Report:")
    print("-" * 50)
    report = classification_report(y_test, y_pred, output_dict=True)
    print(classification_report(y_test, y_pred))
    
    # Confusion Matrix
    print("  Confusion Matrix:")
    print("-" * 50)
    cm = confusion_matrix(y_test, y_pred, labels=["High", "Medium", "Low"])
    labels = ["High", "Medium", "Low"]
    
    # Print formatted confusion matrix
    print(f"{'':>12} | {'Predicted':^30}")
    print(f"{'Actual':>12} | {labels[0]:^10} {labels[1]:^10} {labels[2]:^10}")
    print("-" * 50)
    for i, label in enumerate(labels):
        print(f"{label:>12} | {cm[i][0]:^10} {cm[i][1]:^10} {cm[i][2]:^10}")
    
    metrics = {
        "accuracy": accuracy,
        "classification_report": report,
        "confusion_matrix": cm.tolist()
    }
    
    return metrics


def save_trained_models(pipeline: Pipeline):
    """
    Save the trained pipeline and individual components.
    
    Args:
        pipeline: Trained pipeline to save
    """
    create_model_directory()
    
    # Save the complete pipeline (recommended for inference)
    joblib.dump(pipeline, PIPELINE_PATH)
    print(f"✓ Saved pipeline to: {PIPELINE_PATH}")
    
    # Also save components separately (for flexibility)
    vectorizer = pipeline.named_steps["tfidf"]
    classifier = pipeline.named_steps["classifier"]
    
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print(f"✓ Saved vectorizer to: {VECTORIZER_PATH}")
    
    joblib.dump(classifier, MODEL_PATH)
    print(f"✓ Saved classifier to: {MODEL_PATH}")
    
    # Save model metadata
    metadata = {
        "trained_at": datetime.now().isoformat(),
        "tfidf_config": TFIDF_CONFIG,
        "logreg_config": LOGREG_CONFIG,
        "classes": list(pipeline.classes_),
        "n_features": len(vectorizer.vocabulary_)
    }
    
    metadata_path = os.path.join(MODEL_DIR, "model_metadata.pkl")
    joblib.dump(metadata, metadata_path)
    print(f"✓ Saved metadata to: {metadata_path}")


def load_trained_pipeline() -> Pipeline:
    """
    Load the trained pipeline from disk.
    
    Returns:
        Trained Pipeline object
        
    Raises:
        FileNotFoundError: If model files don't exist
    """
    if not os.path.exists(PIPELINE_PATH):
        raise FileNotFoundError(
            f"Model not found at '{PIPELINE_PATH}'. "
            "Please run 'python -m src.train' first to train the model."
        )
    
    pipeline = joblib.load(PIPELINE_PATH)
    print(f"✓ Loaded model from: {PIPELINE_PATH}")
    
    return pipeline


if __name__ == "__main__":
    try:
        # Train the model
        pipeline, metrics = train_model()
        
        print("\nNext steps:")
        print("  1. Run 'streamlit run app.py' to test the model")
        print("  2. Check models/ directory for saved model files")
        
    except FileNotFoundError as e:
        print(f"\nError: {e}")
        print("\nTo fix this, run the following commands:")
        print("  1. python data_generator.py  (generate training data)")
        print("  2. python -m src.train       (train the model)")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        raise
