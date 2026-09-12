export interface AnalysisItem {
  review: string;
  label: "positive" | "negative" | "neutral" | "error";
  score: number;
  theme: string;
}

export interface FeedbackRecord {
  id: number;
  review: string;
  label: string;
  score: number;
  theme: string;
  timestamp?: string;
}
