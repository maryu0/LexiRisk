import React, { useRef, useState } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FileUpload({
  onFileSelect,
  isLoading = false,
  error = null,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      return;
    }
    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center
          transition-all duration-200 cursor-pointer
          ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
          }
          ${isLoading ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Analyzing document...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  This may take a few moments
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {selectedFileName ? (
                  <FileText className="w-8 h-8 text-blue-600" />
                ) : (
                  <Upload className="w-8 h-8 text-blue-600" />
                )}
              </div>

              <div>
                <p className="text-base font-semibold text-slate-900">
                  {selectedFileName || "Upload a legal document"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedFileName
                    ? "Click to select a different file"
                    : "Click to browse or drag and drop a PDF file"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>PDF only</span>
                <span>•</span>
                <span>Max 10MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Upload failed</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
