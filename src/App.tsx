import { useState, useEffect } from "react";
import { AnalysisItem, FeedbackRecord } from "./types";
import { ReviewsInput } from "./components/ReviewsInput";
import { ResultsTable } from "./components/ResultsTable";
import { SummaryMetrics } from "./components/SummaryMetrics";
import { HistoryExpander } from "./components/HistoryExpander";
import { ThemeToggle } from "./components/ThemeToggle";

const SAMPLE_REVIEWS = [
  "The food was delicious but the delivery took over an hour. Not happy.",
  "The customer service was exceptional and friendly! Loved everything.",
  "Prices are slightly high for the small portions, but quality is decent.",
  "Packaging was torn and order was wrong. Very disappointing.",
];

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customer_feedback_theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const [reviewsText, setReviewsText] = useState<string>("");
  const [results, setResults] = useState<AnalysisItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<FeedbackRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Sync theme with document class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("customer_feedback_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Top Header Bar with Title & Theme Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📝</span>
              <span>Customer Feedback Analyzer</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-slate-400 text-sm">
              Paste your customer reviews below, one review per line.
            </p>
          </div>
          <div className="self-start sm:self-auto flex items-center gap-2">
            <a
              id="github-repo-link"
              href="https://github.com/ouqbah/AI_Engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
              title="GitHub Repository: ouqbah/AI_Engineer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <ThemeToggle theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </div>

        {/* Warning message if user clicks Analyze with empty text */}
        {warningMessage && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-md text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{warningMessage}</span>
            </span>
            <button
              type="button"
              onClick={() => setWarningMessage(null)}
              className="text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 font-bold ml-2 cursor-pointer"
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
