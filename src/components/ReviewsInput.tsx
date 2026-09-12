import React from "react";

interface ReviewsInputProps {
  reviewsText: string;
  setReviewsText: (val: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onLoadSample: () => void;
}

export const ReviewsInput: React.FC<ReviewsInputProps> = ({
  reviewsText,
  setReviewsText,
  onAnalyze,
  isAnalyzing,
  onLoadSample,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-xs mb-6 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="reviews-textarea" className="font-semibold text-gray-800 dark:text-slate-200 text-sm">
          Reviews
        </label>
        <button
          type="button"
          onClick={onLoadSample}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline cursor-pointer"
        >
          Load sample reviews
        </button>
      </div>

      <textarea
        id="reviews-textarea"
        rows={8}
        value={reviewsText}
        onChange={(e) => setReviewsText(e.target.value)}
        placeholder="The food was delicious but the delivery took over an hour. Not happy.&#10;The customer service was exceptional and friendly! Loved everything.&#10;Prices are slightly high for the small portions, but quality is decent.&#10;Packaging was torn and order was wrong. Very disappointing."
        className="w-full p-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm leading-relaxed transition-colors"
      />

      <div className="mt-4 flex items-center justify-between">
        <button
          id="btn-analyze"
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 text-white font-medium rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            "Analyze"
          )}
        </button>
        <span className="text-xs text-gray-500 dark:text-slate-400">One review per line</span>
      </div>
    </div>
  );
};
