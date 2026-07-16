from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.ollama_service import review_code

router = APIRouter(tags=["Review"])


class ReviewRequest(BaseModel):
    code: str = Field(..., min_length=5, description="Source code to review")
    language: str = Field(default="python", description="Programming language")
    focus: str = Field(default="general", description="Focus area for review")
    model: str = Field(default=None, description="Ollama model to use (optional)")


class Issue(BaseModel):
    severity: str
    line: int | None = None
    title: str
    description: str


class ReviewResponse(BaseModel):
    summary: str
    score: int
    issues: list[Issue]
    positives: list[str]
    refactored_snippet: str | None = None


@router.post("/review", response_model=ReviewResponse, summary="Review code with local AI")
def review(request: ReviewRequest):
    try:
        result = review_code(request.code, request.language, request.focus, request.model)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")
