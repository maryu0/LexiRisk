import {
  LegalDocument,
  Clause,
  Entity,
  RiskLevel,
} from "../data/sampleDocument";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface BackendError {
  success: false;
  errorCode?: string;
  message?: string;
}

interface BackendClause {
  clauseNumber: number;
  clauseTitle: string;
  clauseText: string;
  riskLevel: string;
  confidenceScore: number;
  plainEnglishSummary: string;
}

interface BackendEntity {
  value: string | null;
  confidence: number;
}

interface BackendResponse {
  success: boolean;
  documentName: string;
  riskScore: number;
  riskLabel: string;
  totalClauses: number;
  entities: {
    parties?: BackendEntity;
    effectiveDate?: BackendEntity;
    governingLaw?: BackendEntity;
    termLength?: BackendEntity;
    liabilityCap?: BackendEntity;
    autoRenewal?: BackendEntity;
  };
  clauses: BackendClause[];
}

/**
 * Upload and analyze a PDF document
 */
export async function analyzeDocument(file: File): Promise<LegalDocument> {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyse`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // ML service specific errors come back as 503
      if (response.status === 503 && (data as BackendError).errorCode) {
        const d = data as BackendError;
        throw new Error(`ML_SERVICE_UNAVAILABLE: ${d.message}`);
      }
      throw new Error(
        (data as BackendError).message || `Server error: ${response.status}`,
      );
    }

    return convertBackendResponseToDocument(data as BackendResponse, file.name);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze document: ${error.message}`);
    }
    throw new Error("Failed to analyze document: Unknown error");
  }
}

/**
 * Generate and download a PDF report
 */
export async function generateReport(document: LegalDocument): Promise<Blob> {
  try {
    // Convert document back to backend format
    const backendFormat = convertDocumentToBackendFormat(document);

    const response = await fetch(`${API_BASE_URL}/api/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendFormat),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
    throw new Error("Failed to generate report: Unknown error");
  }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Convert backend response to frontend LegalDocument format
 */
function convertBackendResponseToDocument(
  data: BackendResponse,
  fileName: string,
): LegalDocument {
  // Extract parties from entities
  const parties: string[] = [];
  if (data.entities.parties?.value) {
    parties.push(
      ...data.entities.parties.value.split("&").map((p) => p.trim()),
    );
  }

  // Convert entities
  const entities: Entity[] = [];
  if (data.entities.governingLaw?.value) {
    entities.push({
      label: "Governing Law",
      value: data.entities.governingLaw.value,
      confidence: data.entities.governingLaw.confidence,
    });
  }
  if (data.entities.termLength?.value) {
    entities.push({
      label: "Term Length",
      value: data.entities.termLength.value,
      confidence: data.entities.termLength.confidence,
    });
  }
  if (data.entities.autoRenewal?.value) {
    entities.push({
      label: "Auto-Renewal",
      value: data.entities.autoRenewal.value,
      confidence: data.entities.autoRenewal.confidence,
    });
  }
  if (data.entities.liabilityCap?.value) {
    entities.push({
      label: "Liability Cap",
      value: data.entities.liabilityCap.value,
      confidence: data.entities.liabilityCap.confidence,
    });
  }

  // Convert clauses
  const clauses: Clause[] = data.clauses.map((clause, index) => ({
    id: `c${index + 1}`,
    number: `${clause.clauseNumber}.`,
    title: clause.clauseTitle,
    text: clause.clauseText,
    riskLevel: normalizeRiskLevel(clause.riskLevel),
    explanation: clause.plainEnglishSummary,
  }));

  // DEBUG: Log raw and normalized risk levels for first clause
  if (data.clauses.length > 0) {
    console.log("[API] Raw clause riskLevel:", data.clauses[0].riskLevel);
    console.log("[API] Normalized riskLevel:", clauses[0].riskLevel);
    console.log(
      "[API] Risk level distribution:",
      clauses.reduce(
        (acc, c) => {
          acc[c.riskLevel] = (acc[c.riskLevel] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    );
  }

  return {
    title: fileName.replace(".pdf", ""),
    parties,
    effectiveDate: data.entities.effectiveDate?.value || "Not specified",
    overallRiskScore: data.riskScore,
    overallRiskLevel: normalizeRiskLevel(data.riskLabel),
    status: "Analysis Complete",
    clauses,
    entities,
  };
}

/**
 * Convert frontend LegalDocument to backend format for report generation
 */
function convertDocumentToBackendFormat(document: LegalDocument) {
  return {
    documentName: `${document.title}.pdf`,
    processedAt: new Date().toISOString(),
    riskScore: document.overallRiskScore,
    riskLabel: document.overallRiskLevel,
    totalClauses: document.clauses.length,
    entities: {
      parties: {
        value: document.parties.join(" & "),
        confidence: 95,
      },
      effectiveDate: {
        value: document.effectiveDate,
        confidence: 95,
      },
      governingLaw: {
        value:
          document.entities.find((e) => e.label === "Governing Law")?.value ||
          null,
        confidence:
          document.entities.find((e) => e.label === "Governing Law")
            ?.confidence || 0,
      },
      termLength: {
        value:
          document.entities.find((e) => e.label === "Term Length")?.value ||
          null,
        confidence:
          document.entities.find((e) => e.label === "Term Length")
            ?.confidence || 0,
      },
      liabilityCap: {
        value:
          document.entities.find((e) => e.label === "Liability Cap")?.value ||
          null,
        confidence:
          document.entities.find((e) => e.label === "Liability Cap")
            ?.confidence || 0,
      },
      autoRenewal: {
        value:
          document.entities.find((e) => e.label === "Auto-Renewal")?.value ||
          null,
        confidence:
          document.entities.find((e) => e.label === "Auto-Renewal")
            ?.confidence || 0,
      },
    },
    clauses: document.clauses.map((clause, index) => ({
      clauseNumber: index + 1,
      clauseTitle: clause.title,
      clauseText: clause.text,
      riskLevel: clause.riskLevel,
      confidenceScore: 90, // Default confidence
      plainEnglishSummary: clause.explanation || "",
    })),
  };
}

/**
 * Normalize risk level strings to match frontend type
 */
function normalizeRiskLevel(level: string): RiskLevel {
  const normalized = level.toLowerCase();
  if (
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low" ||
    normalized === "none"
  ) {
    return normalized as RiskLevel;
  }
  return "none";
}
