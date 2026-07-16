const API_BASE = "http://localhost:8000/api";

// Check Ollama status on load
async function checkOllamaStatus() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  try {
    const res = await fetch(`${API_BASE}/models`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data.error) {
      dot.className = "dot dot-error";
      text.textContent = "Ollama not running — run: ollama serve";
      return;
    }
    dot.className = "dot dot-ok";
    text.textContent = `Ollama connected — ${data.models.length} model(s) available: ${data.models.join(", ") || "none pulled yet"}`;

    // Populate model select with actual installed models
    if (data.models.length > 0) {
      const sel = document.getElementById("modelSelect");
      sel.innerHTML = "";
      data.models.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        sel.appendChild(opt);
      });
    }
  } catch {
    dot.className = "dot dot-error";
    text.textContent = "Cannot reach backend — make sure FastAPI is running: uvicorn main:app --reload";
  }
}

async function submitReview() {
  const code = document.getElementById("codeInput").value.trim();
  if (!code) return showError("Please paste some code first.");

  const language = document.getElementById("language").value;
  const focus = document.getElementById("focus").value;
  const model = document.getElementById("modelSelect").value;

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, focus, model }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Server error");
    }

    const data = await res.json();
    renderResult(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function renderResult(data) {
  document.getElementById("resultSection").style.display = "block";

  const badge = document.getElementById("scoreBadge");
  badge.textContent = data.score;
  badge.className = "score-badge";
  if (data.score >= 7) badge.classList.add("high");
  else if (data.score >= 4) badge.classList.add("mid");
  else badge.classList.add("low");

  document.getElementById("summaryCard").textContent = data.summary;

  const issuesList = document.getElementById("issuesList");
  issuesList.innerHTML = "";
  if (!data.issues || !data.issues.length) {
    issuesList.innerHTML = '<p style="color:#6b7280;font-size:13px;">No issues found 🎉</p>';
  } else {
    data.issues.forEach((issue) => {
      const div = document.createElement("div");
      div.className = `issue-item ${issue.severity}`;
      div.innerHTML = `
        <div class="issue-top">
          <span class="severity-tag ${issue.severity}">${issue.severity}</span>
          <span class="issue-title">${escapeHtml(issue.title)}</span>
          ${issue.line ? `<span class="issue-line">Line ${issue.line}</span>` : ""}
        </div>
        <p class="issue-desc">${escapeHtml(issue.description)}</p>`;
      issuesList.appendChild(div);
    });
  }

  const positivesList = document.getElementById("positivesList");
  positivesList.innerHTML = "";
  (data.positives || []).forEach((p) => {
    const div = document.createElement("div");
    div.className = "positive-item";
    div.textContent = p;
    positivesList.appendChild(div);
  });

  const refactorCard = document.getElementById("refactorCard");
  if (data.refactored_snippet) {
    refactorCard.style.display = "block";
    const codeEl = document.getElementById("refactorCode");
    codeEl.textContent = data.refactored_snippet;
    hljs.highlightElement(codeEl);
  } else {
    refactorCard.style.display = "none";
  }

  document.getElementById("resultSection").scrollIntoView({ behavior: "smooth" });
}

function setLoading(state) {
  document.getElementById("loader").style.display = state ? "flex" : "none";
  document.getElementById("resultSection").style.display = state ? "none" : "block";
  document.getElementById("reviewBtn").disabled = state;
}

function showError(msg) {
  const toast = document.getElementById("errorToast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 5000);
}

function escapeHtml(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.getElementById("codeInput").addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submitReview();
});

checkOllamaStatus();
