import React from "react";

export const InputForm = ({
  onSubmit,
  loading,
  latex,
  jobDescription,
  onLatexChange,
  onJobDescriptionChange,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(latex, jobDescription);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="latex"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          LaTeX Resume
        </label>
        <textarea
          id="latex"
          value={latex}
          onChange={(e) => onLatexChange(e.target.value)}
          placeholder="Paste your LaTeX resume here..."
          rows="10"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">{latex.length} characters</p>
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Description
        </label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here..."
          rows="10"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {jobDescription.length} characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !latex.trim() || !jobDescription.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Analyzing...
          </span>
        ) : (
          "Analyze Resume"
        )}
      </button>
    </form>
  );
};
