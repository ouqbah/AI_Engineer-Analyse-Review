import React from "react";
import { AnalysisItem } from "../types";

interface SummaryMetricsProps {
  results: AnalysisItem[];
  onSaveToDatabase: () => void;
  isSaving: boolean;
  saveSuccessMessage: string | null;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  results,
  onSaveToDatabase,
  isSaving,
  saveSuccessMessage,
}) => {
  if (!results.length) return null;

  const validScores = results
    .filter((r) => r.label !== "error" && r.score > 0)
    .map((r) => r.score);

  const avgScore = validScores.length
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : "N/A";

  const positiveReviews = results.filter((r) => r.label === "positive");
  const pctPositive = results.length
    ? `${Math.round((positiveReviews.length / results.length) * 100)}%`
    : "0%";

  const validThemes = results
    .filter((r) => r.theme && r.theme !== "error")
    .map((r) => r.theme.toLowerCase());

  let topTheme: string | null = null;
  if (validThemes.length) {
    const counts: Record<string, number> = {};
    for (const t of validThemes) {
      counts[t] = (counts[t] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      topTheme = sorted[0][0];
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>

      {/* 3 Streamlit-style Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Reviews
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{results.length}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Average score
          </div>
          <div className="text-3xl font-extrabold text-gray-900 flex items-baseline gap-1">
            <span>{avgScore}</span>
            {avgScore !== "N/A" && <span className="text-sm font-normal text-gray-400">/ 5</span>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            % Positive
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{pctPositive}</div>
        </div>
      </div>

      {/* Top Theme Info Box */}
      {topTheme && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4 mb-5 flex items-center gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            Customers talk most about:{" "}
            <strong className="font-bold underline capitalize">{topTheme}</strong>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-4 flex items-center gap-4">
        <button
          id="btn-save-db"
          type="button"
          onClick={onSaveToDatabase}
          disabled={isSaving}
          className="px-5 py-2.5 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-medium rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "💾 Save to database"}
        </button>

        {saveSuccessMessage && (
          <div className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-1.5 flex items-center gap-2 animate-fade-in">
            <span>✓</span>
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
