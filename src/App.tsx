import { useState, useEffect } from "react";
import { AnalysisItem, FeedbackRecord } from "./types";
import { ReviewsInput } from "./components/ReviewsInput";
import { ResultsTable } from "./components/ResultsTable";
import { SummaryMetrics } from "./components/SummaryMetrics";
import { HistoryExpander } from "./components/HistoryExpander";

const SAMPLE_REVIEWS = [
  "The food was delicious but the delivery took over an hour. Not happy.",
  "The customer service was exceptional and friendly! Loved everything.",
  "Prices are slightly high for the small portions, but quality is decent.",
  "Packaging was torn and order was wrong. Very disappointing.",
];

export default function App() {
  const [reviewsText, setReviewsText] = useState<string>("");
  const [results, setResults] = useState<AnalysisItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<FeedbackRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadSample = () => {
    setReviewsText(SAMPLE_REVIEWS.join("\n"));
    setWarningMessage(null);
  };

  const handleAnalyze = async () => {
    const lines = reviewsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setWarningMessage("Please paste at least one review.");
      return;
    }

    setWarningMessage(null);
    setIsAnalyzing(true);
    setSaveSuccessMessage(null);

    const analyzedResults: AnalysisItem[] = [];

    // Mirroring original loop: call backend for each review
    for (const line of lines) {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line }),
        });

        if (response.ok) {
          const data = await response.json();
          analyzedResults.push({
            review: line,
            label: data.label || "neutral",
            score: typeof data.score === "number" ? data.score : 3,
            theme: data.theme || "general",
          });
        } else {
          analyzedResults.push({
            review: line,
            label: "error",
            score: 0,
            theme: "error",
          });
        }
      } catch {
        // One bad review should not stop the whole batch
        analyzedResults.push({
          review: line,
          label: "error",
          score: 0,
          theme: "error",
        });
      }
    }

    setResults(analyzedResults);
    setIsAnalyzing(false);
  };

  const handleSaveToDatabase = async () => {
    if (!results.length) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });

      if (response.ok) {
        setSaveSuccessMessage(`Saved ${results.length} reviews to feedback.db`);
        fetchHistory();
        setTimeout(() => {
          setSaveSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error("Failed to save to database:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Streamlit Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span>📝</span>
            <span>Customer Feedback Analyzer</span>
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Paste your customer reviews below, one review per line.
          </p>
        </div>

        {/* Warning message if user clicks Analyze with empty text */}
        {warningMessage && (
          <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-md text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{warningMessage}</span>
            </span>
            <button
              type="button"
              onClick={() => setWarningMessage(null)}
              className="text-amber-800 hover:text-amber-950 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Reviews Text Area and Action */}
        <ReviewsInput
          reviewsText={reviewsText}
          setReviewsText={setReviewsText}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          onLoadSample={handleLoadSample}
        />

        {/* Results Dataframe Table */}
        <ResultsTable results={results} />

        {/* Summary Metric Cards & Save to Database */}
        <SummaryMetrics
          results={results}
          onSaveToDatabase={handleSaveToDatabase}
          isSaving={isSaving}
          saveSuccessMessage={saveSuccessMessage}
        />

        {/* Expander: Saved History in SQLite */}
        <HistoryExpander
          history={history}
          isLoadingHistory={isLoadingHistory}
          onRefreshHistory={fetchHistory}
          onClearHistory={handleClearHistory}
        />
      </div>
    </div>
  );
}
