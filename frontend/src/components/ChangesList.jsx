import React from "react";

export const ChangesList = ({
  changes,
  matchScore,
  keywords,
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600">Match Score</p>
            <p className="text-3xl font-bold text-blue-900">{matchScore}%</p>
          </div>
          <div className="w-24 h-24 rounded-full bg-white border-4 border-blue-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{matchScore}</p>
              <p className="text-xs text-blue-500">match</p>
            </div>
          </div>
        </div>
      </div>

      {keywords && keywords.length > 0 && (
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

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Suggested Changes
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
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Change {idx + 1}
            </p>

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
