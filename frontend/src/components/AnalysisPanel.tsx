import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { LegalDocument, Clause } from "../data/sampleDocument";
import { Badge } from "./ui/Badge";
interface AnalysisPanelProps {
  document: LegalDocument;
}
export function AnalysisPanel({ document }: AnalysisPanelProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set(),
  );

  // Detect when ML service returned all "none" with zero confidence (silent failure)
  const mlServiceFailed =
    document.clauses.length > 0 &&
    document.overallRiskScore === 0 &&
    document.clauses.every((c) => c.riskLevel === "none");

  const toggleClause = (id: string) => {
    const newSet = new Set(expandedClauses);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedClauses(newSet);
  };
  const riskyClauses = document.clauses
    .filter((c) => c.riskLevel !== "none")
    .sort((a, b) => {
      const riskWeight = {
        high: 3,
        medium: 2,
        low: 1,
        none: 0,
      };
      return (
        riskWeight[b.riskLevel as keyof typeof riskWeight] -
        riskWeight[a.riskLevel as keyof typeof riskWeight]
      );
    });
  const topRisks = riskyClauses.slice(0, 3);

  // Generate document summary
  const getDocumentSummary = () => {
    const hasRisks = document.clauses.some((c) => c.riskLevel !== "none");
    const highCount = document.clauses.filter(
      (c) => c.riskLevel === "high",
    ).length;
    const mediumCount = document.clauses.filter(
      (c) => c.riskLevel === "medium",
    ).length;
    const lowCount = document.clauses.filter(
      (c) => c.riskLevel === "low",
    ).length;

    if (!hasRisks) {
      return "Unable to analyze this document. Please ensure the ML service is running and try uploading again.";
    }

    let summary = `This ${document.title} contains ${document.clauses.length} clause${document.clauses.length !== 1 ? "s" : ""}. `;

    if (highCount > 0) {
      summary += `${highCount} clause${highCount > 1 ? "s" : ""} pose${highCount === 1 ? "s" : ""} significant legal risks that require careful review. `;
    }
    if (mediumCount > 0) {
      summary += `${mediumCount} clause${mediumCount > 1 ? "s have" : " has"} moderate business implications. `;
    }
    if (lowCount > 0) {
      summary += `${lowCount} clause${lowCount > 1 ? "s are" : " is"} standard boilerplate with minimal risk. `;
    }

    if (document.overallRiskScore >= 70) {
      summary += "Strong legal review is highly recommended before signing.";
    } else if (document.overallRiskScore >= 40) {
      summary +=
        "Standard legal review is recommended to understand obligations.";
    } else {
      summary += "This appears to be a relatively standard agreement.";
    }

    return summary;
  };

  const riskCounts = document.clauses.reduce(
    (acc, clause) => {
      acc[clause.riskLevel] = (acc[clause.riskLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const chartData = [
    {
      name: "High",
      value: riskCounts.high || 0,
      color: "#dc2626",
    },
    {
      name: "Medium",
      value: riskCounts.medium || 0,
      color: "#f59e0b",
    },
    {
      name: "Low",
      value: riskCounts.low || 0,
      color: "#0ea5e9",
    },
    {
      name: "None",
      value: riskCounts.none || 0,
      color: "#cbd5e1",
    },
  ].filter((d) => d.value > 0);
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };
  const getRiskBorderColor = (level: string) => {
    switch (level) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-amber-500";
      case "low":
        return "border-sky-500";
      default:
        return "border-slate-300";
    }
  };
  return (
    <div className="w-[380px] bg-white border-l border-slate-200 h-[calc(100vh-64px)] overflow-y-auto fixed right-0 top-16 z-10">
      <div className="p-6 space-y-8">
        {/* ML Service failure warning banner */}
        {mlServiceFailed && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-snug">
              <span className="font-semibold">Analysis incomplete</span> — ML
              service did not respond. Please ensure{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">
                python server.py
              </code>{" "}
              is running in{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">
                ml_service/
              </code>{" "}
              and try uploading again.
            </p>
          </div>
        )}
        {/* Section: Document Summary */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Document Summary
          </h2>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200/80">
            <p className="text-sm text-slate-700 leading-relaxed">
              {getDocumentSummary()}
            </p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section: Watch Out */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            Watch Out For These
          </h2>
          {topRisks.length > 0 ? (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-4">
              {topRisks.map((clause) => (
                <div
                  key={`top-${clause.id}`}
                  className={`pl-3 border-l-[3px] ${getRiskBorderColor(clause.riskLevel)}`}
                >
                  <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                    {clause.title}
                    <Badge
                      variant={getRiskBadgeVariant(clause.riskLevel)}
                      size="sm"
                      className="scale-90 origin-left"
                    >
                      {clause.riskLevel}
                    </Badge>
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-snug">
                    {clause.explanation || "Review this clause carefully."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 text-center">
              <p className="text-sm text-slate-500">
                {document.clauses.some((c) => c.riskLevel !== "none")
                  ? "No high or medium risk clauses detected."
                  : "Unable to detect risks. ML service may be offline."}
              </p>
            </div>
          )}
        </section>

        <hr className="border-slate-100" />

        {/* Section: Chart */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            Risk Breakdown
          </h2>
          {chartData.length > 0 ? (
            <div className="h-48 w-full bg-slate-50/50 rounded-lg border border-slate-200/80 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#475569",
                    }}
                  />

                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      color: "#94a3b8",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 w-full bg-slate-50/50 rounded-lg border border-slate-200/80 p-4 flex items-center justify-center">
              <p className="text-sm text-slate-500 text-center">
                No risk data available. Please check ML service status.
              </p>
            </div>
          )}
        </section>

        <hr className="border-slate-100" />

        {/* Section: Clause Analysis */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Clause Analysis
          </h2>
          <div className="space-y-2">
            {document.clauses.map((clause) => (
              <div
                key={`analysis-${clause.id}`}
                className="border border-slate-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:border-slate-300"
              >
                <button
                  onClick={() => toggleClause(clause.id)}
                  className="w-full flex items-center justify-between p-3 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getRiskBadgeVariant(clause.riskLevel)}
                      size="sm"
                      className="w-16 justify-center"
                    >
                      {clause.riskLevel}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
                      {clause.number} {clause.title}
                    </span>
                  </div>
                  {expandedClauses.has(clause.id) ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedClauses.has(clause.id) && (
                  <div className="px-3 pb-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-md text-[13px] text-slate-500 border border-slate-100 leading-relaxed">
                      {clause.explanation ? (
                        <span className="text-slate-600">
                          {clause.explanation}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Standard clause. No significant risks detected.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section: Extracted Entities */}
        <section className="pb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Extracted Entities
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {document.entities.map((entity, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 text-sm ${idx !== document.entities.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">
                    {entity.label}
                  </div>
                  <div className="font-medium text-slate-800">
                    {entity.value}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-slate-400 mb-0.5">
                    Confidence
                  </div>
                  <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {entity.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
