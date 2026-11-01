from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.resume_service import analyze_resume

router = APIRouter(prefix="/resume", tags=["Resume AI"])


class ResumeScoreRequest(BaseModel):
    resume_text: str
    career_id: Optional[int] = None


@router.post("/score")
def score_resume(
    data: ResumeScoreRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not data.resume_text or len(data.resume_text.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is too short. Please provide at least 30 characters of content to analyze.",
        )
    return analyze_resume(db, current_user, data.resume_text, data.career_id)
