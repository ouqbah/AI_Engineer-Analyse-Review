import fs from "fs";
import path from "path";

export interface FeedbackRecord {
  id: number;
  review: string;
  label: string;
  score: number;
  theme: string;
  timestamp?: string;
}

const DB_FILE = path.join(process.cwd(), "feedback.json");

let feedbackStore: FeedbackRecord[] = [];
let nextId = 1;

export function initDb(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      feedbackStore = JSON.parse(data);
      const maxId = feedbackStore.reduce((m, r) => Math.max(m, r.id || 0), 0);
      nextId = maxId + 1;
      console.log(`[DB] Loaded ${feedbackStore.length} reviews from ${DB_FILE}`);
    } else {
      feedbackStore = [];
      nextId = 1;
      persist();
      console.log(`[DB] Initialized new feedback storage at ${DB_FILE}`);
    }
  } catch (err) {
    console.warn("[DB] Could not load existing feedback file, starting empty:", err);
    feedbackStore = [];
    nextId = 1;
  }
}

function persist(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(feedbackStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Failed to persist feedback database:", err);
  }
}

export function saveResults(
  results: Array<{ review: string; label: string; score: number; theme: string }>
): FeedbackRecord[] {
  const newRecords: FeedbackRecord[] = results.map((r) => ({
    id: nextId++,
    review: r.review,
    label: r.label,
    score: r.score,
    theme: r.theme,
    timestamp: new Date().toISOString(),
  }));

  feedbackStore.push(...newRecords);
  persist();
  return newRecords;
}

export function loadHistory(): FeedbackRecord[] {
  return [...feedbackStore];
}

export function clearHistory(): void {
  feedbackStore = [];
  nextId = 1;
  persist();
}
