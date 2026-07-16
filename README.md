# 🔍 AI Code Reviewer — Local (Ollama)

A fullstack AI-powered code reviewer that runs **100% locally** — no API key, no internet, no cost.  
Built with **FastAPI** + **Ollama** (backend) and **vanilla HTML/CSS/JS** (frontend).

![Local AI](https://img.shields.io/badge/AI-100%25%20Local-10b981?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)

## Features

- Paste code → get instant AI review, all on your machine
- Detects **critical issues**, **warnings**, and **suggestions** with line references
- Quality **score (1–10)** and suggested **refactored snippet**
- Auto-detects installed Ollama models and shows them in the UI
- Focus modes: General, Security, Performance, Readability
- Supports Python, JS, TS, Java, Go, Rust, SQL, PHP

## Requirements

- Python 3.11+
- [Ollama](https://ollama.com) installed
- Minimum 8GB RAM (16GB recommended for larger models)

## Quick Start

### 1. Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: download from https://ollama.com/download
```

### 2. Pull a model (pick one)

```bash
ollama pull qwen2.5-coder   # ⭐ Recommended — best for code
ollama pull codellama        # Meta's code model
ollama pull llama3.2         # General purpose
```

### 3. Start Ollama

```bash
ollama serve
```

### 4. Setup backend

```bash
git clone https://github.com/YOUR_USERNAME/ai-code-reviewer-local.git
cd ai-code-reviewer-local/backend

python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example .env     # optional: change model in .env
```

### 5. Run backend

```bash
uvicorn main:app --reload
```

API running at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### 6. Open frontend

Open `frontend/index.html` in your browser — no build step needed.  
The UI will auto-detect your installed models.

## Project Structure

```
ai-code-reviewer-local/
├── backend/
│   ├── main.py                   # FastAPI app + /api/models endpoint
│   ├── routers/
│   │   └── review.py             # POST /api/review
│   ├── services/
│   │   └── ollama_service.py     # Ollama integration
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
├── .gitignore
└── README.md
```

## API

### `GET /api/models`
Returns list of installed Ollama models.

### `POST /api/review`

```json
{
  "code": "def add(a, b): return a + b",
  "language": "python",
  "focus": "general",
  "model": "qwen2.5-coder"
}
```

**Response:**
```json
{
  "summary": "Simple function, works correctly...",
  "score": 7,
  "issues": [
    {
      "severity": "suggestion",
      "line": 1,
      "title": "Missing type hints",
      "description": "Add type annotations for better readability."
    }
  ],
  "positives": ["Concise", "Single responsibility"],
  "refactored_snippet": "def add(a: int, b: int) -> int:\n    return a + b"
}
```

## Model Comparison

| Model | Size | Best For |
|---|---|---|
| `qwen2.5-coder` | ~4GB | Code review (recommended) |
| `codellama` | ~4GB | Code generation & review |
| `llama3.2` | ~2GB | General, fast |
| `deepseek-coder` | ~4GB | Alternative code model |

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, Pydantic, Python |
| Local AI | Ollama |
| Frontend | HTML, CSS, Vanilla JS |
| Syntax Highlight | highlight.js |

## License

MIT
