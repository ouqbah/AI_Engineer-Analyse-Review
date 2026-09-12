import React, { useState } from "react";
import { FeedbackRecord } from "../types";

interface HistoryExpanderProps {
  history: FeedbackRecord[];
  isLoadingHistory: boolean;
  onRefreshHistory: () => void;
  onClearHistory: () => void;
}

export const HistoryExpander: React.FC<HistoryExpanderProps> = ({
  history,
  isLoadingHistory,
  onRefreshHistory,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => {
          if (!isOpen) onRefreshHistory();
          setIsOpen(!isOpen);
        }}
        className="w-full px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span>📚</span>
          <span>Saved history (all reviews in the database)</span>
          {history.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          )}
        </span>
        <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {isLoadingHistory ? (
                <span>Loading history...</span>
              ) : history.length > 0 ? (
                <span>Total saved so far: <strong className="text-gray-900">{history.length}</strong></span>
              ) : (
                <span>Nothing saved yet. Analyze some reviews and click Save.</span>
              )}
            </div>

            {history.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onRefreshHistory}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Clear history
                </button>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center text-gray-400">#</th>
                      <th className="py-2.5 px-3">Review</th>
                      <th className="py-2.5 px-3 w-24">Label</th>
                      <th className="py-2.5 px-3 w-16">Score</th>
                      <th className="py-2.5 px-3 w-28">Theme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {history.map((h, i) => (
                      <tr key={h.id || i} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-center text-gray-400 font-mono">
                          {i + 1}
                        </td>
                        <td className="py-2.5 px-3 text-gray-900 font-normal">
                          {h.review}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-2xs font-semibold rounded ${
                              h.label === "positive"
                                ? "bg-green-100 text-green-800"
                                : h.label === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {h.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium">
                          {h.score > 0 ? h.score : "—"}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {h.theme}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
