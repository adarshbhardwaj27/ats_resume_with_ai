import React from "react";

export const ChangesList = ({
  changes,
  matchScore,
  keywords,
  foundKeywords,
  missingKeywords,
  onApplyChange,
  onApplyAll,
}) => {
  if (!changes || changes.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <p className="text-green-800">
          ✓ No changes suggested. Your resume already aligns well with the job
          description!
        </p>
      </div>
    );
  }

  // Color the score indicator based on value
  const scoreColor =
    matchScore >= 70
      ? "text-green-600 border-green-300"
      : matchScore >= 40
        ? "text-yellow-600 border-yellow-300"
        : "text-red-600 border-red-300";

  const scoreBg =
    matchScore >= 70
      ? "bg-green-50 border-green-200"
      : matchScore >= 40
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className={`${scoreBg} rounded-lg p-4 border`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">ATS Match Score</p>
            <p className={`text-3xl font-bold ${scoreColor.split(" ")[0]}`}>
              {matchScore}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {matchScore >= 70
                ? "Strong match — good chance of passing ATS"
                : matchScore >= 40
                  ? "Moderate match — improvements recommended"
                  : "Low match — significant gaps detected"}
            </p>
          </div>
          <div
            className={`w-20 h-20 rounded-full bg-white border-4 ${scoreColor.split(" ")[1]} flex items-center justify-center`}
          >
            <div className="text-center">
              <p className={`text-xl font-bold ${scoreColor.split(" ")[0]}`}>
                {matchScore}
              </p>
              <p className="text-xs text-gray-500">/ 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Keywords — THE MOST VALUABLE INFO */}
      {missingKeywords && missingKeywords.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">
            ⚠ Missing Keywords ({missingKeywords.length}) — Not found in your
            resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.slice(0, 15).map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full border border-red-300"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-xs text-red-600 mt-2">
            These keywords from the job description are missing. Apply the
            suggested changes below to add them.
          </p>
        </div>
      )}

      {/* Found Keywords */}
      {foundKeywords && foundKeywords.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            ✓ Matched Keywords ({foundKeywords.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {foundKeywords.slice(0, 15).map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full border border-green-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: show all keywords if gap data not available */}
      {(!foundKeywords || foundKeywords.length === 0) &&
        (!missingKeywords || missingKeywords.length === 0) &&
        keywords &&
        keywords.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Key Skills from Job Description:
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 10).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Changes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Suggested Changes ({changes.length})
          </h3>
          {onApplyAll && (
            <button
              onClick={onApplyAll}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition"
            >
              Apply All
            </button>
          )}
        </div>
        {changes.map((change, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Change {idx + 1}
              </p>
              <div className="flex items-center gap-2">
                {change.impact && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      change.impact === "high"
                        ? "bg-red-100 text-red-700"
                        : change.impact === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {change.impact} impact
                  </span>
                )}
                {change.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {change.category.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Original:</p>
                <div className="bg-red-50 border border-red-200 rounded p-3 font-mono text-sm text-red-800 break-words">
                  {change.original}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Updated:</p>
                <div className="bg-green-50 border border-green-200 rounded p-3 font-mono text-sm text-green-800 break-words">
                  {change.updated}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Reason:</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                {change.reason}
              </p>
            </div>

            <button
              onClick={() => onApplyChange(idx)}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition"
            >
              Apply Change
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
