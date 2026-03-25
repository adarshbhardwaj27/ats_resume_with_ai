import React, { useState } from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export function SectionAnalyzer({ latex, jobDescription, onUpdateLatex }) {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [sectionResults, setSectionResults] = useState({});
  const [error, setError] = useState("");

  const handleExtractSections = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex }),
      });

      if (!response.ok) throw new Error("Failed to extract sections");
      const data = await response.json();
      setSections(data.sections);

      // Auto-select first section
      const firstSection = Object.keys(data.sections)[0];
      if (firstSection) {
        setActiveSection(firstSection);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSection = async (sectionName) => {
    if (!sections[sectionName]) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionName,
          sectionContent: sections[sectionName].content,
          jobDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze section");
      const data = await response.json();
      setSectionResults((prev) => ({
        ...prev,
        [sectionName]: data.improvements,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySectionChanges = (sectionName) => {
    const result = sectionResults[sectionName];
    if (!result || !result.sectionContent) return;

    // Replace section in latex
    const originalContent = sections[sectionName].content;
    const updatedLatex = latex.replace(originalContent, result.sectionContent);

    onUpdateLatex(updatedLatex);
    setError(""); // Clear error on success
  };

  if (!sections || Object.keys(sections).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Section-by-Section Analysis
        </h2>
        <p className="text-gray-600 mb-4">
          Analyze your resume section-by-section to prevent AI hallucination and
          get focused, targeted improvements.
        </p>
        <button
          onClick={handleExtractSections}
          disabled={!latex || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Extracting..." : "Extract Sections"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Section-by-Section Analysis
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {Object.entries(sections)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([key, section]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 font-medium transition ${
                activeSection === key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {section.label}
              {sectionResults[key] && (
                <span className="ml-2 text-green-600">✓</span>
              )}
            </button>
          ))}
      </div>

      {/* Section Content */}
      {activeSection && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {sections[activeSection].label}
            </h3>
            <div className="bg-gray-100 p-4 rounded max-h-48 overflow-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                {sections[activeSection].content}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAnalyzeSection(activeSection)}
              disabled={loading || sectionResults[activeSection]}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? "Analyzing..." : "Analyze with AI"}
            </button>

            {sectionResults[activeSection] && (
              <button
                onClick={() => handleApplySectionChanges(activeSection)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Apply Changes
              </button>
            )}
          </div>

          {/* Results */}
          {sectionResults[activeSection] && (
            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                AI Suggestions for {sections[activeSection].label}:
              </h4>

              {sectionResults[activeSection].suggestions &&
              sectionResults[activeSection].suggestions.length > 0 ? (
                <div className="space-y-3">
                  {sectionResults[activeSection].suggestions.map(
                    (suggestion, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-gray-700 mb-1">
                          Change {idx + 1}:
                        </p>
                        <p className="text-red-600 mb-1">
                          ❌ {suggestion.original}
                        </p>
                        <p className="text-green-600 mb-1">
                          ✅ {suggestion.updated}
                        </p>
                        <p className="text-blue-600 text-xs">
                          → {suggestion.reason}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-600">
                  No specific changes needed for this section. It's already
                  well-optimized!
                </p>
              )}

              {sectionResults[activeSection].keywordMatches &&
                sectionResults[activeSection].keywordMatches.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Matched Keywords:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sectionResults[activeSection].keywordMatches.map(
                        (keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
