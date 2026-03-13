import React, { useState } from "react";
import { Download, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { LegalDocument } from "../data/sampleDocument";
import { generateReport } from "../services/api";

interface TopBarProps {
  document: LegalDocument;
}

export function TopBar({ document }: TopBarProps) {
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleDownloadReport = async () => {
    try {
      setIsGenerating(true);

      // Generate the report
      const blob = await generateReport(document);

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.title}_Risk_Analysis_Report.pdf`;
      window.document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate report. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-slate-900 truncate max-w-md">
          {document.title}
        </h1>

        <div className="hidden md:flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">{document.status}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Risk Score
          </span>
          <Badge
            variant={getRiskBadgeVariant(document.overallRiskLevel)}
            size="lg"
            className="font-semibold"
          >
            {document.overallRiskScore} / 100 ·{" "}
            {document.overallRiskLevel.charAt(0).toUpperCase() +
              document.overallRiskLevel.slice(1)}
          </Badge>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={
              isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )
            }
            onClick={handleDownloadReport}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Report"}
          </Button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
            <img
              src="https://i.pravatar.cc/150?u=jane"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
