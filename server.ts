import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDb, saveResults, loadHistory, clearHistory } from "./server/database";
import { analyzeReview } from "./server/gemini";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  initDb();

  // API routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Supports both original FastAPI /analyze path and standard /api/analyze
  app.post(["/analyze", "/api/analyze"], async (req, res) => {
    const text = req.body?.text;
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Missing or invalid review text" });
      return;
    }
    try {
      const result = await analyzeReview(text.trim());
      res.json(result);
    } catch (error) {
      console.error("Error analyzing review:", error);
      res.status(500).json({ label: "error", score: 0, theme: "error" });
    }
  });

  // Batch analyze endpoint
  app.post("/api/analyze-batch", async (req, res) => {
    const reviews = req.body?.reviews;
    if (!Array.isArray(reviews)) {
      res.status(400).json({ error: "Expected 'reviews' array of strings" });
      return;
    }
    const results = [];
    for (const rev of reviews) {
      if (typeof rev === "string" && rev.trim()) {
        try {
          const result = await analyzeReview(rev.trim());
          results.push({ review: rev.trim(), ...result });
        } catch {
          results.push({
            review: rev.trim(),
            label: "error" as const,
            score: 0,
            theme: "error",
          });
        }
      }
    }
    res.json({ results });
  });

  // History endpoints
  app.get("/api/history", (_req, res) => {
    res.json({ history: loadHistory() });
  });

  app.post("/api/history", (req, res) => {
    const results = req.body?.results;
    if (!Array.isArray(results)) {
      res.status(400).json({ error: "Expected 'results' array" });
      return;
    }
    const saved = saveResults(results);
    res.json({ success: true, count: saved.length });
  });

  app.delete("/api/history", (_req, res) => {
    clearHistory();
    res.json({ success: true });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
