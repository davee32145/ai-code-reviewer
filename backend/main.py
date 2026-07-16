from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import review

app = FastAPI(
    title="AI Code Reviewer (Local)",
    description="Review your code using local AI via Ollama — no API key needed",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "AI Code Reviewer (Local) is running"}


@app.get("/api/models")
def list_models():
    """List available Ollama models"""
    import requests
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
        models = [m["name"] for m in res.json().get("models", [])]
        return {"models": models}
    except Exception:
        return {"models": [], "error": "Ollama not running. Start with: ollama serve"}
