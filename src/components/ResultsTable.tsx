import React from "react";
import { AnalysisItem } from "../types";

interface ResultsTableProps {
  results: AnalysisItem[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  if (!results.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-3">Results</h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center text-gray-400 dark:text-slate-500">#</th>
                <th className="py-3 px-4">Review</th>
                <th className="py-3 px-4 w-28">Label</th>
                <th className="py-3 px-4 w-24">Score</th>
                <th className="py-3 px-4 w-32">Theme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
              {results.map((r, idx) => {
                let badgeColor = "bg-gray-100 text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
                if (r.label === "positive") {
                  badgeColor = "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800";
                } else if (r.label === "negative") {
                  badgeColor = "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800";
                } else if (r.label === "neutral") {
                  badgeColor = "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
                } else if (r.label === "error") {
                  badgeColor = "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
                }

                return (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-xs text-gray-400 dark:text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-normal text-gray-900 dark:text-slate-100 leading-relaxed">
                      {r.review}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${badgeColor}`}
                      >
                        {r.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900 dark:text-slate-100">
                      <span className="flex items-center gap-1 font-mono">
                        {r.score > 0 ? (
                          <>
                            <span className="text-amber-500 font-bold">{r.score}</span>
                            <span className="text-gray-400 dark:text-slate-500 text-xs">/ 5</span>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-500 text-xs">N/A</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-mono px-2 py-0.5 rounded-sm border border-gray-200 dark:border-slate-700">
                        {r.theme}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
