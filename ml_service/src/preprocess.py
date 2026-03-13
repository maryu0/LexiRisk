"""
LexiRisk - Preprocessing Module
===============================
This module handles data preprocessing and risk level mapping for legal clauses.

The CUAD dataset has 41 clause labels. This module maps them to 3 risk categories:
- High Risk: Clauses that impose significant legal/business obligations
- Medium Risk: Clauses with moderate business impact
- Low Risk: Standard boilerplate clauses

Usage:
    from src.preprocess import preprocess_data, load_data
"""

import os
import pandas as pd
import re
from typing import Tuple, List, Optional

# ============================================================================
# Risk Level Mapping Configuration
# ============================================================================

# Map CUAD clause types to risk levels
# These mappings are based on typical legal risk assessments

HIGH_RISK_CLAUSES = [
    "non-compete",
    "non-solicit", 
    "exclusive-deal",
    "uncapped-liability",
    "anti-assignment",
    # Additional CUAD labels that map to high risk
    "cap on liability",
    "audit rights",
    "most favored nation",
    "rofr/rofo/rofn",  # Right of first refusal/offer/negotiation
    "change of control",
    "liquidated damages",
]

MEDIUM_RISK_CLAUSES = [
    "termination-for-convenience",
    "renewal-term",
    "governing-law",
    "ip-ownership",
    # Additional CUAD labels that map to medium risk
    "termination for convenience",
    "expiration date",
    "renewal term",
    "governing law",
    "ip ownership assignment",
    "license grant",
    "non-transferable license",
    "affiliate license",
    "source code escrow",
    "post-termination services",
    "competing products",
    "minimum commitment",
    "volume restriction",
    "price restrictions",
    "warranty duration",
    "insurance",
]

LOW_RISK_CLAUSES = [
    "notice",
    "counterparts",
    "amendments",
    "waiver",
    "entire-agreement",
    # Additional CUAD labels that map to low risk
    "no-solicit of employees",
    "covenant not to sue",
    "third party beneficiary",
    "document name",
    "parties",
    "agreement date",
    "effective date",
    "jurisdiction",
    "venue",
]


def normalize_clause_type(clause_type: str) -> str:
    """
    Normalize clause type string for consistent matching.
    
    Args:
        clause_type: Raw clause type string
        
    Returns:
        Normalized clause type in lowercase with consistent formatting
    """
    # Convert to lowercase
    normalized = clause_type.lower().strip()
    
    # Replace various separators with hyphens
    normalized = re.sub(r'[\s_]+', '-', normalized)
    
    # Remove special characters except hyphens
    normalized = re.sub(r'[^a-z0-9\-]', '', normalized)
    
    return normalized


def map_to_risk_level(clause_type: str) -> str:
    """
    Map a clause type to its corresponding risk level.
    
    Args:
        clause_type: The type/category of the legal clause
        
    Returns:
        Risk level: "High", "Medium", or "Low"
    """
    normalized = normalize_clause_type(clause_type)
    
    # Check against high risk clauses
    for high_risk in HIGH_RISK_CLAUSES:
        if normalize_clause_type(high_risk) in normalized or normalized in normalize_clause_type(high_risk):
            return "High"
    
    # Check against medium risk clauses
    for medium_risk in MEDIUM_RISK_CLAUSES:
        if normalize_clause_type(medium_risk) in normalized or normalized in normalize_clause_type(medium_risk):
            return "Medium"
    
    # Check against low risk clauses
    for low_risk in LOW_RISK_CLAUSES:
        if normalize_clause_type(low_risk) in normalized or normalized in normalize_clause_type(low_risk):
            return "Low"
    
    # Default to Medium for unknown clause types (conservative approach)
    return "Medium"


def load_data(data_path: str = "data/training_data.csv") -> pd.DataFrame:
    """
    Load training data from CSV file.
    
    Args:
        data_path: Path to the CSV file
        
    Returns:
        DataFrame with clause_text, clause_type, and risk_level columns
        
    Raises:
        FileNotFoundError: If the data file doesn't exist
    """
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Training data not found at '{data_path}'. "
            "Please run 'python data_generator.py' first to generate dummy data."
        )
    
    df = pd.read_csv(data_path)
    
    # Validate required columns
    required_columns = ["clause_text", "risk_level"]
    missing_cols = [col for col in required_columns if col not in df.columns]
    
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    print(f"✓ Loaded {len(df)} samples from {data_path}")
    
    return df


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess the training data:
    - Clean text
    - Ensure risk levels are mapped correctly
    - Remove duplicates
    
    Args:
        df: Raw DataFrame with clause data
        
    Returns:
        Preprocessed DataFrame ready for training
    """
    # Create a copy to avoid modifying original
    processed_df = df.copy()
    
    # Clean clause text
    processed_df["clause_text"] = processed_df["clause_text"].apply(clean_text)
    
    # If clause_type exists but risk_level needs remapping
    if "clause_type" in processed_df.columns:
        processed_df["risk_level"] = processed_df["clause_type"].apply(map_to_risk_level)
    
    # Remove any rows with empty text
    processed_df = processed_df[processed_df["clause_text"].str.len() > 0]
    
    # Remove duplicates
    initial_count = len(processed_df)
    processed_df = processed_df.drop_duplicates(subset=["clause_text"])
    removed_count = initial_count - len(processed_df)
    
    if removed_count > 0:
        print(f"✓ Removed {removed_count} duplicate entries")
    
    print(f"✓ Preprocessed {len(processed_df)} samples")
    
    return processed_df


def clean_text(text: str) -> str:
    """
    Clean and normalize clause text for better model training.
    
    Args:
        text: Raw clause text
        
    Returns:
        Cleaned text
    """
    if not isinstance(text, str):
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def get_train_test_split(
    df: pd.DataFrame, 
    test_size: float = 0.2, 
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split data into training and testing sets with stratification.
    
    Args:
        df: Preprocessed DataFrame
        test_size: Proportion of data for testing
        random_state: Random seed for reproducibility
        
    Returns:
        Tuple of (train_df, test_df)
    """
    from sklearn.model_selection import train_test_split
    
    train_df, test_df = train_test_split(
        df,
        test_size=test_size,
        random_state=random_state,
        stratify=df["risk_level"]  # Ensure balanced split across risk levels
    )
    
    print(f"✓ Split data: {len(train_df)} train, {len(test_df)} test samples")
    
    return train_df, test_df


def get_risk_level_stats(df: pd.DataFrame) -> dict:
    """
    Get statistics about risk level distribution.
    
    Args:
        df: DataFrame with risk_level column
        
    Returns:
        Dictionary with risk level counts and percentages
    """
    stats = {}
    total = len(df)
    
    for level in ["High", "Medium", "Low"]:
        count = len(df[df["risk_level"] == level])
        stats[level] = {
            "count": count,
            "percentage": round(count / total * 100, 1) if total > 0 else 0
        }
    
    return stats


if __name__ == "__main__":
    # Test the preprocessing pipeline
    print("=" * 50)
    print("LexiRisk - Preprocessing Module Test")
    print("=" * 50)
    print()
    
    try:
        # Load and preprocess data
        df = load_data()
        processed_df = preprocess_data(df)
        
        # Show risk level distribution
        print("\nRisk Level Distribution:")
        stats = get_risk_level_stats(processed_df)
        for level, info in stats.items():
            print(f"  - {level}: {info['count']} ({info['percentage']}%)")
        
        # Test train/test split
        print()
        train_df, test_df = get_train_test_split(processed_df)
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("\nRun 'python data_generator.py' first to generate training data.")
