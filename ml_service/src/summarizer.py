"""
LexiRisk - Summarization Module
===============================
Uses a fast extractive summarization approach that scores and selects the most
informative sentences from a legal clause. This runs in milliseconds with no
model loading required, making it suitable for batch processing of 20-30 clauses.

BART-based deep learning summarization was replaced because it processes clauses
serially at ~5s each, causing timeouts on documents with many clauses.

Usage:
    from src.summarizer import summarize_text, check_model_available
"""

import re
from typing import Optional

# ============================================================================
# Legal keyword weights for sentence scoring
# ============================================================================

# High-signal legal terms that indicate important obligations or risks
_HIGH_WEIGHT_TERMS = [
    "shall", "must", "required", "obligat", "liable", "liability",
    "indemnif", "warrant", "terminat", "breach", "penalt", "damage",
    "restrict", "prohibit", "confidential", "exclusive", "irrevocable",
    "perpetual", "unlimited", "notwithstanding", "waive", "forfeit",
]

_MEDIUM_WEIGHT_TERMS = [
    "agree", "represent", "covenant", "undertake", "ensure", "comply",
    "govern", "jurisdict", "arbitrat", "dispute", "renew", "assign",
    "transfer", "intellectual property", "copyright", "payment", "fee",
]


# ============================================================================
# Public API
# ============================================================================

def summarize_text(
    text: str,
    max_length: Optional[int] = None,
    min_length: Optional[int] = None,
) -> str:
    """
    Generate a plain-English summary of a legal clause using fast extractive
    sentence selection.

    Sentences are scored by:
    - Position (first sentence scores highest — usually the key obligation)
    - Presence of high/medium weight legal keywords
    - Sentence length (prefer 10-50 word sentences)

    Args:
        text: The clause text to summarize
        max_length: Unused — kept for API compatibility
        min_length: Unused — kept for API compatibility

    Returns:
        A 1-3 sentence plain-English summary string
    """
    if not text or not text.strip():
        return "No text provided for summarization."

    text = text.strip()
    words = text.split()

    # Very short clauses — return as-is
    if len(words) < 20:
        return text

    sentences = _split_sentences(text)
    if not sentences:
        return text[:300]

    # Score each sentence
    scored = []
    for i, sent in enumerate(sentences):
        score = _score_sentence(sent, i, len(sentences))
        scored.append((score, i, sent))

    # Sort by score descending, then restore document order for top picks
    scored.sort(key=lambda x: -x[0])
    top_indices = sorted([idx for _, idx, _ in scored[:2]])

    summary_sentences = [sentences[i] for i in top_indices]
    summary = " ".join(summary_sentences).strip()

    # Append a plain-english note about the risk keyword found
    risk_note = _generate_risk_note(text)
    if risk_note and risk_note.lower() not in summary.lower():
        summary = summary + " " + risk_note

    return summary if summary else text[:300]


def check_model_available() -> bool:
    """Always returns True — extractive summarization needs no external model."""
    return True


# ============================================================================
# Internal helpers
# ============================================================================

def _split_sentences(text: str) -> list:
    """Split text into sentences using punctuation boundaries."""
    # Split on period/semicolon followed by space+capital or end of string
    raw = re.split(r'(?<=[.;])\s+(?=[A-Z("])|(?<=[.;])\s*$', text)
    # Also split on newlines that look like sentence boundaries
    sentences = []
    for part in raw:
        sub = re.split(r'\n\s*\n', part)
        sentences.extend([s.strip() for s in sub if s.strip()])
    # Filter out very short fragments (< 5 words)
    return [s for s in sentences if len(s.split()) >= 5]


def _score_sentence(sentence: str, position: int, total: int) -> float:
    """Score a sentence for extractive selection."""
    score = 0.0
    lower = sentence.lower()
    word_count = len(sentence.split())

    # Position bonus: first sentence is most likely the core obligation
    if position == 0:
        score += 3.0
    elif position == 1:
        score += 1.5
    elif position == total - 1:
        score += 0.5  # last sentence sometimes has consequences

    # Keyword scoring
    for term in _HIGH_WEIGHT_TERMS:
        if term in lower:
            score += 2.0

    for term in _MEDIUM_WEIGHT_TERMS:
        if term in lower:
            score += 1.0

    # Prefer medium-length sentences (10-60 words)
    if 10 <= word_count <= 60:
        score += 1.0
    elif word_count > 100:
        score -= 1.0  # very long sentences are hard to read

    return score


def _generate_risk_note(text: str) -> str:
    """Generate a short plain-English note based on detected risk keywords."""
    lower = text.lower()
    notes = []

    if any(t in lower for t in ["indemnif", "hold harmless"]):
        notes.append("This clause creates indemnification obligations.")
    if any(t in lower for t in ["terminat", "cancel"]):
        notes.append("This clause governs termination rights.")
    if "confidential" in lower or "non-disclosure" in lower:
        notes.append("This clause imposes confidentiality obligations.")
    if any(t in lower for t in ["non-compete", "not compete", "competitive"]):
        notes.append("This clause restricts competitive activities.")
    if any(t in lower for t in ["liability", "liable", "damages"]):
        notes.append("This clause addresses liability and damages.")
    if any(t in lower for t in ["intellectual property", "copyright", "patent"]):
        notes.append("This clause covers intellectual property rights.")
    if any(t in lower for t in ["governing law", "jurisdiction", "arbitrat"]):
        notes.append("This clause defines dispute resolution terms.")
    if any(t in lower for t in ["auto", "renew", "automatically"]):
        notes.append("This clause may include automatic renewal terms.")

    return notes[0] if notes else ""


def summarize_legal_clause(clause_text: str) -> dict:
    """
    Summarize a legal clause with additional metadata.
    Returns a dict compatible with the rest of the codebase.
    """
    summary = summarize_text(clause_text)
    original_words = len(clause_text.split())
    summary_words = len(summary.split())
    compression_ratio = round((1 - summary_words / max(original_words, 1)) * 100, 1)
    return {
        "summary": summary,
        "original_length": original_words,
        "summary_length": summary_words,
        "compression_ratio": f"{compression_ratio}%",
    }


def summarize_legal_clause(clause_text: str) -> dict:
    """
    Summarize a legal clause with additional context.
    
    Provides a structured response suitable for the LexiRisk application.
    
    Args:
        clause_text: The legal clause text to summarize
        
    Returns:
        Dictionary with summary and metadata
    """
    # Generate summary
    summary = summarize_text(clause_text)
    
    # Calculate compression ratio
    original_words = len(clause_text.split())
    summary_words = len(summary.split())
    compression_ratio = round((1 - summary_words / max(original_words, 1)) * 100, 1)
    
    return {
        "summary": summary,
        "original_length": original_words,
        "summary_length": summary_words,
        "compression_ratio": f"{compression_ratio}%"
    }


def check_model_available() -> bool:
    """
    Check if the summarization model can be loaded.
    
    Returns:
        True if model is available, False otherwise
    """
    try:
        get_summarizer()
        return True
    except Exception:
        return False


def clear_model_cache():
    """Clear the cached model to free memory."""
    global _summarizer_cache
    
    if _summarizer_cache["model"] is not None:
        del _summarizer_cache["model"]
        del _summarizer_cache["tokenizer"]
        
    _summarizer_cache = {
        "model": None,
        "tokenizer": None,
        "is_loaded": False,
        "model_name": None
    }
    
    # Attempt to free GPU memory if using CUDA
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except ImportError:
        pass
    
    print("✓ Model cache cleared")


if __name__ == "__main__":
    # Test the summarization module
    print("=" * 60)
    print("LexiRisk - Summarization Module Test")
    print("=" * 60)
    print()
    
    # Test clause
    test_clause = """
    The Employee agrees that during the term of employment and for a period of 
    twenty-four (24) months following the termination of employment for any reason, 
    the Employee shall not, directly or indirectly, solicit, induce, recruit, or 
    encourage any employee, consultant, or contractor of the Company to leave their 
    employment or engagement with the Company, or otherwise interfere with the 
    business relationship between the Company and any of its employees, consultants, 
    or contractors. This non-solicitation covenant applies to all employees, 
    consultants, and contractors with whom the Employee had contact or about whom 
    the Employee received confidential information during the last two years of 
    employment.
    """
    
    print("Original Clause:")
    print("-" * 60)
    print(test_clause.strip())
    print()
    
    print("Generating Summary...")
    print("-" * 60)
    
    result = summarize_legal_clause(test_clause)
    
    print(f"Summary: {result['summary']}")
    print()
    print(f"Original: {result['original_length']} words")
    print(f"Summary: {result['summary_length']} words")
    print(f"Compression: {result['compression_ratio']}")
