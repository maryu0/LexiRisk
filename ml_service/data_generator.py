"""
LexiRisk - Data Generator
=========================
This script generates dummy legal clause data for training when the CUAD dataset is unavailable.
It creates synthetic examples for each clause type mapped to their risk levels.

Usage: python data_generator.py
Output: data/training_data.csv
"""

import os
import csv
import random

# Define clause types and their associated risk levels
# High Risk: clauses that impose significant obligations or restrictions
# Medium Risk: clauses with moderate business impact
# Low Risk: standard boilerplate clauses

CLAUSE_TEMPLATES = {
    # HIGH RISK CLAUSES
    "non-compete": [
        "The Employee agrees not to engage in any competitive business activities within a 50-mile radius for a period of 2 years following termination.",
        "Contractor shall not directly or indirectly compete with the Company in any manner during the term of this Agreement and for 3 years thereafter.",
        "The Seller covenants that it will not engage in any business that competes with the Buyer's business for 5 years post-closing.",
        "Executive agrees to refrain from any competitive employment within the industry for 18 months after separation.",
        "The non-compete restriction shall apply globally and prohibit engagement with any competing entity."
    ],
    "non-solicit": [
        "Employee shall not solicit any customers, clients, or employees of the Company for a period of 2 years following termination.",
        "The Contractor agrees not to recruit or hire any personnel from the Company for 3 years after the end of this engagement.",
        "Seller shall not directly or indirectly solicit business from any of Buyer's customers for 24 months post-closing.",
        "The non-solicitation covenant extends to all clients serviced during the last 2 years of employment.",
        "Neither party shall solicit or attempt to hire any employees of the other party during the contract term and for 1 year thereafter."
    ],
    "exclusive-deal": [
        "The Distributor is granted exclusive rights to sell the Products within the Territory, and the Manufacturer shall not appoint any other distributors.",
        "This Agreement grants exclusive licensing rights, and no similar licenses shall be granted to third parties.",
        "The exclusivity provision requires Company to source 100% of its requirements from Supplier during the term.",
        "Vendor shall be the sole and exclusive provider of services described herein for the duration of this Agreement.",
        "The exclusive dealing arrangement restricts Client from engaging with competing service providers."
    ],
    "uncapped-liability": [
        "The indemnifying party's liability under this Agreement shall not be subject to any cap or limitation.",
        "Notwithstanding any other provision, liability for breach of confidentiality shall be unlimited.",
        "The Contractor accepts unlimited liability for any damages arising from gross negligence or willful misconduct.",
        "There shall be no cap on liability for intellectual property infringement claims.",
        "The insurance requirements notwithstanding, the performing party's liability remains uncapped."
    ],
    "anti-assignment": [
        "Neither party may assign or transfer this Agreement without the prior written consent of the other party, which may be withheld in its sole discretion.",
        "Any attempted assignment without consent shall be null and void and constitute a material breach.",
        "The rights and obligations under this Agreement are personal and may not be delegated or assigned.",
        "Assignment to affiliates requires 30 days prior notice and is subject to the non-assigning party's reasonable approval.",
        "This Agreement is binding and may not be assigned even in connection with a merger or change of control without consent."
    ],
    
    # MEDIUM RISK CLAUSES
    "termination-for-convenience": [
        "Either party may terminate this Agreement for any reason upon 30 days' written notice.",
        "The Client reserves the right to terminate this engagement at its convenience with 60 days' prior notice.",
        "Notwithstanding other termination provisions, Company may end this contract without cause upon 90 days' notice.",
        "Termination for convenience shall not relieve either party of obligations accrued prior to termination.",
        "The convenience termination clause allows either party to exit with 45 days' written notice."
    ],
    "renewal-term": [
        "This Agreement shall automatically renew for successive one-year periods unless terminated by either party with 60 days' notice.",
        "The initial term shall be followed by automatic renewals unless written notice is provided 90 days before expiration.",
        "Upon expiration, this contract will renew on a month-to-month basis under the same terms and conditions.",
        "Automatic renewal shall occur unless either party provides notice of non-renewal at least 30 days prior.",
        "The Agreement renews automatically, with pricing adjustments of up to 5% permitted upon each renewal."
    ],
    "governing-law": [
        "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.",
        "The parties agree that New York law shall govern all disputes arising under this Agreement.",
        "This contract is subject to English law and the exclusive jurisdiction of the English courts.",
        "California law, without regard to conflict of law principles, shall govern this Agreement.",
        "Any disputes shall be resolved under the laws of Singapore and subject to Singapore court jurisdiction."
    ],
    "ip-ownership": [
        "All intellectual property created during the engagement shall be the sole property of the Client.",
        "The Contractor assigns all rights, title, and interest in any work product to the Company.",
        "Pre-existing IP remains with its original owner; new IP developed jointly shall be co-owned.",
        "The Company retains all intellectual property rights in its proprietary systems and methodologies.",
        "Work-for-hire provisions apply, and all deliverables become Client's exclusive property upon payment."
    ],
    
    # LOW RISK CLAUSES
    "notice": [
        "All notices under this Agreement shall be in writing and delivered to the addresses set forth herein.",
        "Notice shall be deemed given when delivered personally, or 3 business days after mailing by certified mail.",
        "Electronic notice via email to the designated contact shall be considered valid delivery.",
        "Any notice required shall be sent to the parties at their respective addresses on the signature page.",
        "Notice of any breach must be provided within 10 business days of discovery."
    ],
    "counterparts": [
        "This Agreement may be executed in counterparts, each of which shall be deemed an original.",
        "The parties may sign this document in multiple counterparts, and all together constitute one agreement.",
        "Execution by electronic signature and in counterparts is permitted and binding.",
        "Counterpart signatures, including facsimile and PDF, shall have the same effect as original signatures.",
        "This Agreement becomes effective when counterparts signed by all parties have been exchanged."
    ],
    "amendments": [
        "This Agreement may only be amended by a written instrument signed by both parties.",
        "No modification of this contract shall be valid unless executed in writing by authorized representatives.",
        "Amendments must be in writing and expressly state that they amend this Agreement.",
        "Oral modifications are not binding; only written amendments signed by both parties are effective.",
        "Any changes to the scope of work must be documented through a formal written amendment."
    ],
    "waiver": [
        "Failure to enforce any provision shall not constitute a waiver of the right to enforce it later.",
        "No waiver of any breach shall be deemed a waiver of any subsequent breach of the same or different kind.",
        "Waivers must be in writing and signed by the waiving party to be effective.",
        "The exercise or failure to exercise any right shall not operate as a waiver thereof.",
        "A waiver of any term or condition shall not be construed as a waiver of any other term or condition."
    ],
    "entire-agreement": [
        "This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations.",
        "This document represents the complete agreement and replaces all previous discussions, whether oral or written.",
        "The entire agreement clause confirms that no other representations have induced either party to enter this contract.",
        "All prior proposals, negotiations, and representations are merged into this final Agreement.",
        "This Agreement, including all attachments, constitutes the sole agreement between the parties on this subject matter."
    ]
}

# Risk level mapping
RISK_MAPPING = {
    "non-compete": "High",
    "non-solicit": "High",
    "exclusive-deal": "High",
    "uncapped-liability": "High",
    "anti-assignment": "High",
    "termination-for-convenience": "Medium",
    "renewal-term": "Medium",
    "governing-law": "Medium",
    "ip-ownership": "Medium",
    "notice": "Low",
    "counterparts": "Low",
    "amendments": "Low",
    "waiver": "Low",
    "entire-agreement": "Low"
}


def generate_training_data(output_path: str = "data/training_data.csv", num_samples: int = 50):
    """
    Generate dummy training data for the LexiRisk classifier.
    
    Args:
        output_path: Path to save the CSV file
        num_samples: Minimum number of samples to generate (actual count may be higher)
    
    Returns:
        Path to the generated CSV file
    """
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    data = []
    
    # Ensure we have at least num_samples by cycling through clause types
    samples_per_type = max(1, num_samples // len(CLAUSE_TEMPLATES))
    
    for clause_type, templates in CLAUSE_TEMPLATES.items():
        risk_level = RISK_MAPPING[clause_type]
        
        # Add multiple samples per clause type
        for i in range(samples_per_type):
            # Cycle through templates
            template = templates[i % len(templates)]
            
            # Add slight variations by occasionally adding context
            variations = [
                template,
                f"Pursuant to Section 5, {template.lower()}",
                f"{template} This provision shall survive termination.",
                f"Notwithstanding the foregoing, {template.lower()}",
            ]
            
            clause_text = random.choice(variations)
            
            data.append({
                "clause_text": clause_text,
                "clause_type": clause_type,
                "risk_level": risk_level
            })
    
    # Shuffle the data for better training
    random.shuffle(data)
    
    # Write to CSV
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["clause_text", "clause_type", "risk_level"])
        writer.writeheader()
        writer.writerows(data)
    
    print(f"✓ Generated {len(data)} training samples")
    print(f"✓ Saved to: {output_path}")
    print(f"\nRisk Level Distribution:")
    
    # Print distribution
    risk_counts = {"High": 0, "Medium": 0, "Low": 0}
    for item in data:
        risk_counts[item["risk_level"]] += 1
    
    for level, count in risk_counts.items():
        print(f"  - {level}: {count} samples")
    
    return output_path


def check_cuad_dataset(cuad_path: str = "data/cuad") -> bool:
    """
    Check if the CUAD dataset exists.
    
    Args:
        cuad_path: Path to check for CUAD dataset
        
    Returns:
        True if CUAD dataset is found, False otherwise
    """
    return os.path.exists(cuad_path) and os.listdir(cuad_path)


if __name__ == "__main__":
    print("=" * 50)
    print("LexiRisk - Training Data Generator")
    print("=" * 50)
    print()
    
    # Check if CUAD dataset exists
    if check_cuad_dataset():
        print("CUAD dataset found! You can use the real data for training.")
        print("Run this script with --force to generate dummy data anyway.")
    else:
        print("CUAD dataset not found. Generating dummy training data...")
        print()
        generate_training_data(num_samples=50)
        print()
        print("Next step: Run 'python -m src.train' to train the model.")
