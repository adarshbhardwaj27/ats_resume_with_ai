import React, { useState } from "react";
import { InputForm } from "./components/InputForm";
import { ChangesList } from "./components/ChangesList";
import { LaTeXPreview } from "./components/LaTeXPreview";
import { ErrorMessage } from "./components/ErrorMessage";
import { SectionAnalyzer } from "./components/SectionAnalyzer";
import { analyzeResume } from "./services/api";
import "./index.css";

function App() {
  const [latex, setLatex] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [changes, setChanges] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [foundKeywords, setFoundKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (latexInput, jobDesc) => {
    setLoading(true);
    setError("");
    setChanges([]);

    try {
      const result = await analyzeResume(latexInput, jobDesc);
      setChanges(result.changes);
      setMatchScore(result.matchScore);
      setKeywords(result.jobKeywords);
      setFoundKeywords(result.foundKeywords || []);
      setMissingKeywords(result.missingKeywords || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyChangeToLatex = (currentLatex, change) => {
    // Try exact match first (replace only the first occurrence)
    if (currentLatex.includes(change.original)) {
      const idx = currentLatex.indexOf(change.original);
      return (
        currentLatex.slice(0, idx) +
        change.updated +
        currentLatex.slice(idx + change.original.length)
      );
    }

    // Try matching with normalized whitespace
    const normalizedOriginal = change.original.trim();
    const lines = currentLatex.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(normalizedOriginal)) {
        lines[i] = lines[i].replace(normalizedOriginal, change.updated.trim());
        return lines.join("\n");
      }
    }

    // If no match found, try fuzzy matching - find lines that contain most of the key words
    const keywords = normalizedOriginal
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (keywords.length > 0) {
      for (let i = 0; i < lines.length; i++) {
        const matchCount = keywords.filter((k) =>
          lines[i].toLowerCase().includes(k.toLowerCase()),
        ).length;
        if (matchCount >= Math.ceil(keywords.length * 0.7)) {
          lines[i] = change.updated.trim();
          return lines.join("\n");
        }
      }
    }

    // If still no match, return unchanged (change not applied)
    console.warn("Could not find text to replace:", change.original);
    return currentLatex;
  };

  const handleApplyChange = (index) => {
    const change = changes[index];
    const updatedLatex = applyChangeToLatex(latex, change);

    if (updatedLatex !== latex) {
      setLatex(updatedLatex);
      // Remove applied change from display
      const newChanges = changes.filter((_, i) => i !== index);
      setChanges(newChanges);
    } else {
      setError(
        "Could not apply change: text not found in LaTeX. Try editing manually.",
      );
    }
  };

  const handleApplyAllChanges = () => {
    let updatedLatex = latex;
    let appliedCount = 0;

    changes.forEach((change) => {
      const newLatex = applyChangeToLatex(updatedLatex, change);
      if (newLatex !== updatedLatex) {
        updatedLatex = newLatex;
        appliedCount++;
      }
    });

    setLatex(updatedLatex);
    setChanges([]); // Clear all changes after applying

    if (appliedCount > 0) {
      setError(""); // Clear any previous errors
    } else {
      setError(
        "No changes could be applied. The original text may not match exactly.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Resume Tailor
          </h1>
          <p className="text-gray-600">
            AI-powered LaTeX resume optimization for ATS alignment
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage error={error} onDismiss={() => setError("")} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inputs</h2>
            <InputForm
              onSubmit={handleAnalyze}
              loading={loading}
              latex={latex}
              jobDescription={jobDescription}
              onLatexChange={setLatex}
              onJobDescriptionChange={setJobDescription}
            />
          </div>

          {/* Output Section */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Analysis Results
            </h2>
            {changes.length === 0 && !error ? (
              <div className="text-gray-500 text-center py-8">
                <p>Submit your resume and job description to see suggestions</p>
              </div>
            ) : (
              <ChangesList
                changes={changes}
                matchScore={matchScore}
                keywords={keywords}
                foundKeywords={foundKeywords}
                missingKeywords={missingKeywords}
                onApplyChange={handleApplyChange}
                onApplyAll={handleApplyAllChanges}
              />
            )}
          </div>

          {/* LaTeX Preview Section */}
          <div className="lg:col-span-1">
            <LaTeXPreview
              latex={latex}
              onApplyAll={handleApplyAllChanges}
              changes={changes}
            />
          </div>
        </div>
        {/* Section-by-Section Analysis */}
        {latex && jobDescription && (
          <div className="mt-8">
            <SectionAnalyzer
              latex={latex}
              jobDescription={jobDescription}
              onUpdateLatex={setLatex}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Resume Tailor uses AI to provide minimal, targeted edits to improve
            ATS alignment
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
