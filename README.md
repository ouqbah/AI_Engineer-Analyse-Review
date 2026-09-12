# 📝 Customer Feedback Analyzer

A full-stack, AI-powered customer feedback analysis application built with **FastAPI**, **Streamlit**, **Google GenAI SDK (Gemini 2.5 Flash)**, and **SQLite**. 

This system processes batch customer reviews, uses structured output generation from Gemini to extract sentiment, ratings, and primary themes, and provides an interactive business intelligence dashboard with persistent historical storage.

---

## 📸 Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND                                 │
│                     Streamlit Dashboard (Port 8501)                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ HTTP POST /analyze
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                BACKEND                                  │
│                       FastAPI Service (Port 8000)                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ Structured Prompt & JSON Schema
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                AI MODEL                                 │
│                        Google Gemini 2.5 Flash                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ Parsed Response (label, score, theme)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE                               │
│                         SQLite Database (feedback.db)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **Batch Sentiment & Theme Extraction**: Paste multi-line customer feedback to analyze each review independently.
- **Strictly Typed Outputs**: Utilizes `Pydantic` and Gemini's `response_schema` enforcement to ensure reliable `label`, `score` (1–5), and single-word `theme` outputs.
- **Interactive Dashboard**: High-level KPI metrics (Total Reviews, Average Rating, % Positive) and automatic identifying of the top recurring customer theme.
- **Data Persistence**: Save feedback reports directly into a local SQLite database (`feedback.db`) with full historical audit functionality.
- **Colab-Ready Deployment**: Includes multi-threaded execution scripts with `pyngrok` tunneling for easy development in Google Colab.

---

## 📁 Project Structure

```text
.
├── api.py               # FastAPI backend microservice handling Gemini API calls
├── app.py               # Streamlit frontend dashboard UI
├── database.py          # SQLite database connection & helper functions
├── sample_reviews.txt   # Sample customer review dataset for testing
└── README.md            # Project documentation
```

---

## 🛠️ Requirements & Installation

### Prerequisites

- Python 3.10+
- Google Gemini API Key (`GOOGLE_API_KEY`)
- Ngrok Authtoken (`NGROK_AUTHTOKEN`) *(optional for Colab tunneling)*

### Dependencies

Install required libraries using `uv` or `pip`:

```bash
pip install fastapi uvicorn streamlit google-genai pydantic python-dotenv pyngrok nest_asyncio
```

---

## 🚀 Running the Project

### Option A: Running Locally (Two Terminals)

#### Terminal 1: Start the FastAPI Backend
```bash
uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```
*API docs available at: `http://127.0.0.1:8000/docs`*

#### Terminal 2: Start the Streamlit Dashboard
```bash
streamlit run app.py
```
*Dashboard will open at: `http://localhost:8501`*

---

### Option B: Running in Google Colab

Run the following unified setup script inside a Colab cell. Make sure your secrets (`GOOGLE_API_KEY` and `NGROK_AUTHTOKEN`) are set in Colab Secrets (the key icon on the left sidebar).

```python
import os
import sys
import time
import uvicorn
import nest_asyncio
import threading
from pyngrok import ngrok
from google.colab import userdata

# 1. Ensure working path is visible
sys.path.append('/content')

# 2. Load API Keys from Colab Secrets
os.environ["GOOGLE_API_KEY"] = userdata.get('GOOGLE_API_KEY')
ngrok.set_auth_token(userdata.get('NGROK_AUTHTOKEN'))

# 3. Prevent asyncio event loop conflicts
nest_asyncio.apply()
ngrok.kill()

# 4. Start FastAPI Backend in background
def run_fastapi():
    uvicorn.run("api:app", host="127.0.0.1", port=8000, log_level="info")

threading.Thread(target=run_fastapi, daemon=True).start()
time.sleep(3)

# 5. Start Streamlit UI in background
def run_streamlit():
    os.system("streamlit run app.py --server.port 8501 --server.address 0.0.0.0")

threading.Thread(target=run_streamlit, daemon=True).start()
time.sleep(3)

# 6. Public Tunneling via Ngrok
public_url = ngrok.connect("127.0.0.1:8501")
print(f"🚀 Streamlit Public App: {public_url}")
```

---

## 🔌 API Reference

### `POST /analyze`

Analyzes a single customer review and returns structured metadata.

#### **Request Body**
```json
{
  "text": "The food was delicious but the delivery took over an hour. Not happy."
}
```

#### **Response Body (200 OK)**
```json
{
  "label": "negative",
  "score": 2,
  "theme": "delivery"
}
```

---

## 📊 Database Schema

The application automatically creates and manages a SQLite database file `feedback.db`:

```sql
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY,
    review TEXT,
    label TEXT,
    score INTEGER,
    theme TEXT
);
```
