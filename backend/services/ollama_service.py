import requests
import json
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder")

SYSTEM_PROMPT = """You are an expert code reviewer. Analyze the given code and respond ONLY with a valid JSON object — no explanation, no markdown, no code fences.

The JSON must follow this exact structure:
{
  "summary": "Brief overall assessment in 2-3 sentences",
  "score": <integer from 1 to 10>,
  "issues": [
    {
      "severity": "critical",
      "line": <integer or null>,
      "title": "Short issue title",
      "description": "Explanation and how to fix it"
    }
  ],
  "positives": ["thing the code does well"],
  "refactored_snippet": "Improved version of the most critical part, or null"
}

severity must be one of: critical, warning, suggestion.
Respond with JSON only. No other text."""


def review_code(code: str, language: str, focus: str, model: str = None) -> dict:
    model = model or DEFAULT_MODEL

    user_message = f"""Review this {language} code. Focus on: {focus}.

Code:
{code}

Respond with valid JSON only."""

    full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}\n\nAssistant:"

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.9,
                },
            },
            timeout=120,
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Cannot connect to Ollama. Make sure Ollama is running: ollama serve"
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Ollama took too long to respond. Try a smaller model.")

    raw = response.json().get("response", "").strip()

    # Strip markdown fences if model added them
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            try:
                return json.loads(part)
            except Exception:
                continue

    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract JSON object from response
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(raw[start:end])
        raise RuntimeError(f"Model returned invalid JSON. Raw response: {raw[:200]}")
