import React, { useState } from "react";
import { Copy, Download, Eye } from "lucide-react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export function LaTeXPreview({ latex, onApplyAll, changes }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/compile-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`PDF download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleViewPreview = () => {
    const encodedLatex = encodeURIComponent(latex);
    window.open(`https://www.overleaf.com/docs?snip=${encodedLatex}`, "_blank");
  };

  const handleDownloadLatex = () => {
    const element = document.createElement("a");
    const file = new Blob([latex], { type: "text/plain" });
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = "resume.tex";
    document.body.appendChild(element);
    element.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">LaTeX Preview</h2>
        {changes.length > 0 && (
          <button
            onClick={onApplyAll}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Apply All Changes
          </button>
        )}
      </div>

      {/* LaTeX Code Display */}
      <div className="mb-4 bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
        <pre>{latex || "Your LaTeX code will appear here..."}</pre>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopyLatex}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Copy size={18} />
          {copied ? "Copied!" : "Copy LaTeX"}
        </button>

        <button
          onClick={handleDownloadLatex}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          <Download size={18} />
          Download .tex
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading || !latex}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {downloading ? "Compiling..." : "Download PDF"}
        </button>

        <button
          onClick={handleViewPreview}
          disabled={!latex}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye size={18} />
          View in Overleaf
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          💡 <strong>Tip:</strong> Copy the LaTeX code, download as PDF, or
          preview in Overleaf
        </p>
      </div>
    </div>
  );
}
