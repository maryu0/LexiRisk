"""
LexiRisk - Streamlit UI
=======================
A simple local UI for testing the LexiRisk ML models before production deployment.

Features:
- Paste legal clause text
- View Risk Level classification (High/Medium/Low)
- View Confidence Score
- View BART-generated Summary

Usage:
    streamlit run app.py
"""

import streamlit as st
import os
import sys

# Add src to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.inference import LexiRiskEngine, check_models_exist

# ============================================================================
# Page Configuration
# ============================================================================

st.set_page_config(
    page_title="LexiRisk - Legal Document Analyzer",
    page_icon="⚖️",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# ============================================================================
# Custom CSS for styling
# ============================================================================

st.markdown("""
<style>
    .risk-high {
        background-color: #ffebee;
        border-left: 5px solid #f44336;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
    }
    .risk-medium {
        background-color: #fff3e0;
        border-left: 5px solid #ff9800;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
    }
    .risk-low {
        background-color: #e8f5e9;
        border-left: 5px solid #4caf50;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
    }
    .confidence-bar {
        height: 20px;
        border-radius: 10px;
        margin: 5px 0;
    }
    .summary-box {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
    }
</style>
""", unsafe_allow_html=True)


# ============================================================================
# Helper Functions
# ============================================================================

@st.cache_resource
def load_engine():
    """Load and cache the LexiRisk engine."""
    try:
        engine = LexiRiskEngine()
        engine.load_model()
        return engine
    except FileNotFoundError:
        return None


def get_risk_color(risk_level: str) -> str:
    """Get color code for risk level."""
    colors = {
        "High": "#f44336",
        "Medium": "#ff9800",
        "Low": "#4caf50"
    }
    return colors.get(risk_level, "#9e9e9e")


def render_risk_badge(risk_level: str):
    """Render a styled risk level badge."""
    class_name = f"risk-{risk_level.lower()}"
    return f'<div class="{class_name}"><strong>{risk_level} Risk</strong></div>'


# ============================================================================
# Main Application
# ============================================================================

def main():
    # Header
    st.title("⚖️ LexiRisk")
    st.markdown("**Legal Document Risk Analyzer** - ML Engine Testing Interface")
    st.markdown("---")
    
    # Check if models exist
    models = check_models_exist()
    
    if not models["classification_pipeline"]:
        # Show setup instructions
        st.error("⚠️ ML Models Not Found!")
        st.markdown("""
        The classification model has not been trained yet. Please run the following commands in your terminal:
        
        ```bash
        # Step 1: Generate training data
        python data_generator.py
        
        # Step 2: Train the model
        python -m src.train
        
        # Step 3: Restart this app
        streamlit run app.py
        ```
        """)
        
        st.info("💡 **Tip:** Make sure you have installed all dependencies first: `pip install -r requirements.txt`")
        return
    
    # Load engine
    engine = load_engine()
    
    if engine is None:
        st.error("Failed to load the ML engine. Please check the model files.")
        return
    
    # Model info sidebar
    with st.sidebar:
        st.header("Model Info")
        try:
            info = engine.get_model_info()
            st.write(f"**Classes:** {', '.join(info['classes'])}")
            st.write(f"**Features:** {info['vectorizer_features']:,}")
            if "trained_at" in info:
                st.write(f"**Trained:** {info['trained_at'][:10]}")
        except Exception as e:
            st.write(f"Could not load model info: {e}")
    
    # Main input area
    st.subheader("📝 Enter Legal Clause")
    
    clause_text = st.text_area(
        "Paste your legal clause text here:",
        height=200,
        placeholder="Example: The Employee agrees not to engage in any competitive business activities within a 50-mile radius for a period of 2 years following termination...",
        help="Enter a legal clause to analyze its risk level and generate a summary."
    )
    
    # Options
    col1, col2 = st.columns(2)
    with col1:
        include_summary = st.checkbox("Generate Summary", value=True, help="Use BART model to summarize the clause")
    with col2:
        show_details = st.checkbox("Show Details", value=True, help="Show confidence scores breakdown")
    
    # Analyze button
    if st.button("🔍 Analyze Clause", type="primary", use_container_width=True):
        if not clause_text.strip():
            st.warning("Please enter some text to analyze.")
            return
        
        with st.spinner("Analyzing clause..."):
            try:
                # Perform analysis
                result = engine.analyze(clause_text, include_summary=include_summary)
                
                # Display Results
                st.markdown("---")
                st.subheader("📊 Analysis Results")
                
                # Risk Level
                st.markdown(render_risk_badge(result.risk_level), unsafe_allow_html=True)
                
                # Confidence Score
                confidence_pct = result.confidence * 100
                st.metric("Confidence Score", f"{confidence_pct:.1f}%")
                
                # Confidence bar
                st.progress(result.confidence)
                
                # Risk Description
                st.info(result.risk_description)
                
                # Detailed confidence scores
                if show_details:
                    st.markdown("**Confidence Breakdown:**")
                    for level in ["High", "Medium", "Low"]:
                        score = result.confidence_scores.get(level, 0)
                        col1, col2 = st.columns([1, 4])
                        with col1:
                            st.write(f"{level}:")
                        with col2:
                            st.progress(score)
                            st.caption(f"{score*100:.1f}%")
                
                # Summary
                if include_summary:
                    st.markdown("---")
                    st.subheader("📄 Summary")
                    st.markdown(f'<div class="summary-box">{result.summary}</div>', unsafe_allow_html=True)
                    
                    # Word count comparison
                    original_words = len(clause_text.split())
                    summary_words = len(result.summary.split())
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Original", f"{original_words} words")
                    with col2:
                        st.metric("Summary", f"{summary_words} words")
                    with col3:
                        compression = (1 - summary_words / max(original_words, 1)) * 100
                        st.metric("Compression", f"{compression:.0f}%")
                
            except Exception as e:
                st.error(f"Analysis failed: {str(e)}")
                st.exception(e)
    
    # Example clauses section
    with st.expander("📚 Sample Clauses for Testing"):
        st.markdown("Click to copy any example clause:")
        
        examples = {
            "Non-Compete (High Risk)": "The Employee agrees not to engage in any competitive business activities within a 50-mile radius for a period of 2 years following termination. This includes direct employment with competitors, consulting for competitors, or starting a competing business.",
            
            "Renewal Term (Medium Risk)": "This Agreement shall automatically renew for successive one-year periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the then-current term.",
            
            "Entire Agreement (Low Risk)": "This Agreement constitutes the entire understanding between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, and agreements between the parties."
        }
        
        for title, text in examples.items():
            st.markdown(f"**{title}:**")
            st.code(text, language=None)
    
    # Footer
    st.markdown("---")
    st.markdown(
        "<center><small>LexiRisk ML Engine • For local testing only • "
        "Models: TF-IDF + LogReg (Classification) | BART (Summarization)</small></center>",
        unsafe_allow_html=True
    )


if __name__ == "__main__":
    main()
