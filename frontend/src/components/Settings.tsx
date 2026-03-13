import { useState } from "react";
import {
  Globe,
  Bell,
  Database,
  Zap,
  Save,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/Button";

export function Settings() {
  const [apiUrl, setApiUrl] = useState("http://localhost:5000");
  const [mlServiceUrl, setMlServiceUrl] = useState("http://localhost:8000");
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  const handleSave = () => {
    // In a real app, this would save to localStorage or backend
    console.log("Settings saved:", {
      apiUrl,
      mlServiceUrl,
      autoSave,
      notifications,
      confidenceThreshold,
    });
    alert("Settings saved successfully!");
  };

  const handleExport = () => {
    const settings = {
      apiUrl,
      mlServiceUrl,
      autoSave,
      notifications,
      confidenceThreshold,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "lexirisk-settings.json";
    window.document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    window.document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all document history? This cannot be undone.",
      )
    ) {
      // In a real app, this would clear from backend/localStorage
      alert("Document history cleared!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">
            Customize your LexiRisk experience and manage integrations
          </p>
        </div>

        {/* API Configuration */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                API Configuration
              </h2>
              <p className="text-sm text-slate-600">
                Configure backend and ML service endpoints
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="http://localhost:5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ML Service URL
              </label>
              <input
                type="text"
                value={mlServiceUrl}
                onChange={(e) => setMlServiceUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="http://localhost:8000"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  // Test connection
                  fetch(`${apiUrl}/api/health`)
                    .then((res) => res.json())
                    .then(() => alert("Backend connection successful!"))
                    .catch(() => alert("Failed to connect to backend"));
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Test Connection
              </button>
            </div>
          </div>
        </section>

        {/* Analysis Settings */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Analysis Settings
              </h2>
              <p className="text-sm text-slate-600">
                Adjust risk detection and confidence thresholds
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Risk Detection Confidence Threshold
                </label>
                <span className="text-sm font-semibold text-indigo-600">
                  {confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500 mt-2">
                Only show risks with confidence above this threshold
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Auto-save Analysis Results
                </p>
                <p className="text-xs text-slate-600">
                  Automatically save documents after analysis
                </p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSave ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSave ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications
              </h2>
              <p className="text-sm text-slate-600">
                Manage notification preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  High Risk Alerts
                </p>
                <p className="text-xs text-slate-600">
                  Get notified when high-risk clauses are detected
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Data Management
              </h2>
              <p className="text-sm text-slate-600">
                Export settings and clear data
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              className="w-full"
            >
              Export Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearHistory}
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Clear Document History
            </Button>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
          <Button variant="outline" size="md">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          >
            Save Changes
          </Button>
        </div>

        {/* Version Info */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            LexiRisk v1.0.0 • Built with React + FastAPI
          </p>
          <p className="text-xs text-slate-400 mt-1">
            © 2026 LexiRisk. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
