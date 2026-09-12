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
    <div className="border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-colors">
      <button
        type="button"
        onClick={() => {
          if (!isOpen) onRefreshHistory();
          setIsOpen(!isOpen);
        }}
        className="w-full px-5 py-4 text-left font-semibold text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span>📚</span>
          <span>Saved history (all reviews in the database)</span>
          {history.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono border border-gray-200 dark:border-slate-700">
              {history.length}
            </span>
          )}
        </span>
        <span className="text-gray-400 dark:text-slate-500 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              {isLoadingHistory ? (
                <span>Loading history...</span>
              ) : history.length > 0 ? (
                <span>
                  Total saved so far: <strong className="text-gray-900 dark:text-slate-100">{history.length}</strong>
                </span>
              ) : (
                <span>Nothing saved yet. Analyze some reviews and click Save.</span>
              )}
            </div>

            {history.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onRefreshHistory}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Clear history
                </button>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-md border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-semibold uppercase tracking-wider sticky top-0 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center text-gray-400 dark:text-slate-500">#</th>
                      <th className="py-2.5 px-3">Review</th>
                      <th className="py-2.5 px-3 w-24">Label</th>
                      <th className="py-2.5 px-3 w-16">Score</th>
                      <th className="py-2.5 px-3 w-28">Theme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                    {history.map((h, i) => (
                      <tr key={h.id || i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-400 dark:text-slate-500 font-mono">
                          {i + 1}
                        </td>
                        <td className="py-2.5 px-3 text-gray-900 dark:text-slate-100 font-normal">
                          {h.review}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-2xs font-semibold rounded ${
                              h.label === "positive"
                                ? "bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300"
                                : h.label === "negative"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {h.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-900 dark:text-slate-100">
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
