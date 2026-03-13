import React from "react";
import { History, FileText, Clock, TrendingUp } from "lucide-react";
import { Badge } from "./ui/Badge";

export function DocumentHistory() {
  // Mock data - in a real app this would come from backend
  const documents = [
    {
      id: 1,
      name: "Service Agreement - TechCorp",
      date: "2026-03-10",
      time: "14:32",
      riskScore: 67,
      riskLevel: "medium",
      clauses: 12,
    },
    {
      id: 2,
      name: "Employment Contract - Jane Smith",
      date: "2026-03-09",
      time: "11:15",
      riskScore: 34,
      riskLevel: "low",
      clauses: 8,
    },
    {
      id: 3,
      name: "NDA - Confidential Project",
      date: "2026-03-08",
      time: "16:45",
      riskScore: 82,
      riskLevel: "high",
      clauses: 15,
    },
    {
      id: 4,
      name: "Lease Agreement - Office Space",
      date: "2026-03-07",
      time: "09:20",
      riskScore: 45,
      riskLevel: "medium",
      clauses: 18,
    },
  ];

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

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-amber-600";
    return "text-sky-600";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Document History
          </h1>
          <p className="text-slate-600">
            View and manage all previously analyzed documents
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-slate-900">
                  {documents.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Risk Score</p>
                <p className="text-3xl font-bold text-slate-900">
                  {Math.round(
                    documents.reduce((sum, doc) => sum + doc.riskScore, 0) /
                      documents.length,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-slate-900">4</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Analyses
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {doc.name}
                      </h3>
                      <Badge
                        variant={getRiskBadgeVariant(doc.riskLevel)}
                        size="sm"
                      >
                        {doc.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {doc.date} at {doc.time}
                      </span>
                      <span>{doc.clauses} clauses analyzed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                      <p
                        className={`text-2xl font-bold ${getRiskColor(doc.riskScore)}`}
                      >
                        {doc.riskScore}
                      </p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      View →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <History className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-indigo-900 font-medium mb-1">
            Document History in Development
          </p>
          <p className="text-xs text-indigo-700">
            Full document history with search, filtering, and re-analysis coming
            soon!
          </p>
        </div>
      </div>
    </div>
  );
}
