import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { DocumentViewer } from "./components/DocumentViewer";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { FileUpload } from "./components/FileUpload";
import { Settings } from "./components/Settings";
import { DocumentHistory } from "./components/DocumentHistory";
import { EntityLibrary } from "./components/EntityLibrary";
import { sampleDocument, LegalDocument } from "./data/sampleDocument";
import { analyzeDocument } from "./services/api";

type ActiveView = "dashboard" | "history" | "library" | "settings";

function App() {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mlWarning, setMlWarning] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setMlWarning(null);

    try {
      const analyzedDocument = await analyzeDocument(file);
      setDocument(analyzedDocument);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      if (msg.includes("ML_SERVICE_UNAVAILABLE")) {
        // Surface as a warning banner so the user can retry, not a hard error
        setMlWarning(
          msg.replace(
            "Failed to analyze document: ML_SERVICE_UNAVAILABLE: ",
            "",
          ),
        );
      } else {
        setError(msg);
      }
      console.error("Analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSample = () => {
    setDocument(sampleDocument);
    setShowSample(true);
  };

  const handleReset = () => {
    setDocument(null);
    setShowSample(false);
    setError(null);
    setMlWarning(null);
  };

  // Show document analysis if we have a document
  const displayDocument = document || (showSample ? sampleDocument : null);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left Sidebar (Fixed width) */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 relative">
        {activeView === "settings" ? (
          <Settings />
        ) : activeView === "history" ? (
          <DocumentHistory />
        ) : activeView === "library" ? (
          <EntityLibrary />
        ) : mlWarning ? (
          /* ML Service unavailable — full-page warning */
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg px-6">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-3">⚠️</div>
                <h2 className="text-lg font-semibold text-amber-800 mb-2">
                  ML Service Unavailable
                </h2>
                <p className="text-sm text-amber-700 mb-4 leading-relaxed">
                  {mlWarning}
                </p>
                <p className="text-xs text-amber-600 mb-5 font-mono bg-amber-100 rounded px-3 py-2">
                  cd ml_service &amp;&amp; python server.py
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : displayDocument ? (
          <>
            {/* Top Bar */}
            <TopBar document={displayDocument} />

            {/* Content Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Center: Document Viewer (Scrollable) */}
              <main className="flex-1 overflow-y-auto mr-[380px] scroll-smooth">
                <DocumentViewer document={displayDocument} />

                {/* Reset button */}
                <div className="flex justify-center pb-8">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Analyze Another Document
                  </button>
                </div>
              </main>

              {/* Right: Analysis Panel (Fixed width, independently scrollable) */}
              <AnalysisPanel document={displayDocument} />
            </div>
          </>
        ) : (
          /* File Upload Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl px-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Lexi<span className="text-slate-600">Risk</span>
                </h1>
                <p className="text-lg text-slate-600">
                  AI-Powered Legal Document Risk Analysis
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Upload a legal contract to analyze clauses, identify risks,
                  and get plain English summaries
                </p>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                error={error}
              />

              {/* Sample Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleUseSample}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                  disabled={isLoading}
                >
                  Or view a sample document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { App };
