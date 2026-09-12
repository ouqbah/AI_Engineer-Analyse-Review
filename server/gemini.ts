import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export interface AnalysisResult {
  label: "positive" | "negative" | "neutral" | "error";
  score: number;
  theme: string;
}

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function heuristicAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();

  // Detect theme
  let theme = "service";
  if (
    lower.includes("deliver") ||
    lower.includes("shipping") ||
    lower.includes("courier") ||
    lower.includes("late") ||
    lower.includes("hour")
  ) {
    theme = "delivery";
  } else if (
    lower.includes("food") ||
    lower.includes("taste") ||
    lower.includes("delicious") ||
    lower.includes("flavor") ||
    lower.includes("dish")
  ) {
    theme = "taste";
  } else if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("expensive") ||
    lower.includes("cheap") ||
    lower.includes("value") ||
    lower.includes("portion")
  ) {
    theme = "price";
  } else if (
    lower.includes("service") ||
    lower.includes("staff") ||
    lower.includes("waiter") ||
    lower.includes("friendly") ||
    lower.includes("rude")
  ) {
    theme = "service";
  } else if (
    lower.includes("packaging") ||
    lower.includes("package") ||
    lower.includes("quality") ||
    lower.includes("torn") ||
    lower.includes("wrong")
  ) {
    theme = "quality";
  }

  // Detect sentiment
  const positiveSignals = [
    "delicious",
    "exceptional",
    "loved",
    "great",
    "friendly",
    "awesome",
    "good",
    "excellent",
    "best",
    "happy",
  ];
  const negativeSignals = [
    "not happy",
    "disappointing",
    "disappointed",
    "terrible",
    "horrible",
    "slow",
    "late",
    "wrong",
    "torn",
    "bad",
    "over an hour",
    "rude",
  ];

  let posScore = 0;
  let negScore = 0;
  for (const p of positiveSignals) {
    if (lower.includes(p)) posScore++;
  }
  for (const n of negativeSignals) {
    if (lower.includes(n)) negScore++;
  }

  if (posScore > negScore) {
    return {
      label: "positive",
      score: posScore >= 2 ? 5 : 4,
      theme,
    };
  } else if (negScore > posScore) {
    return {
      label: "negative",
      score: negScore >= 2 ? 1 : 2,
      theme,
    };
  } else {
    return {
      label: "neutral",
      score: 3,
      theme,
    };
  }
}

export async function analyzeReview(text: string): Promise<AnalysisResult> {
  const client = getClient();

  if (!client) {
    console.info(
      "[AI Studio] GEMINI_API_KEY not configured. Using rule-based fallback analyzer."
    );
    return heuristicAnalysis(text);
  }

  try {
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt =
      "Analyze this customer review.\n" +
      "label must be 'positive', 'negative', or 'neutral'.\n" +
      "score must be a number from 1 (very bad) to 5 (very good).\n" +
      "theme must be ONE lowercase word for the main topic " +
      "(for example: delivery, taste, price, service, quality).\n" +
      `Review: ${text}`;

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: {
              type: Type.STRING,
              description: "positive, negative, or neutral",
            },
            score: {
              type: Type.INTEGER,
              description: "1 (very bad) to 5 (very good)",
            },
            theme: {
              type: Type.STRING,
              description: "ONE lowercase word for the main topic",
            },
          },
          required: ["label", "score", "theme"],
        },
      },
    });

    const parsedText = response.text?.trim();
    if (parsedText) {
      const data = JSON.parse(parsedText);
      const label = ["positive", "negative", "neutral"].includes(
        data.label?.toLowerCase()
      )
        ? (data.label.toLowerCase() as "positive" | "negative" | "neutral")
        : "neutral";
      const score = Number.isInteger(data.score)
        ? Math.max(1, Math.min(5, data.score))
        : 3;
      const theme = String(data.theme || "general").toLowerCase().trim();

      return { label, score, theme };
    }

    return heuristicAnalysis(text);
  } catch (error) {
    console.error("Gemini API call failed, falling back to heuristic:", error);
    return heuristicAnalysis(text);
  }
}
