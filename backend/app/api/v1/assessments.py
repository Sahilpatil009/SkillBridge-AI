from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentSubmit, AssessmentResult
from app.services.assessment_service import (
    create_assessment,
    submit_assessment,
    get_assessment_history,
    get_assessment_result,
    get_assessment_session,
    serialize_questions,
)

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.post("", status_code=201)
def start_assessment(data: AssessmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = create_assessment(db, current_user, data)
    return {
        "assessment_id": result["assessment_id"],
        "skill_id": result["skill_id"],
        "status": result["status"],
        "questions": serialize_questions(result["questions"]),
    }


@router.get("/history")
def history(
    skill_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = get_assessment_history(db, current_user.id, skill_id)
    return [
        {
            "id": a.id,
            "skill_id": a.skill_id,
            "skill_name": a.skill.name if a.skill else "",
            "score_percentage": a.score_percentage,
            "proficiency_level": a.proficiency_level,
            "total_questions": a.total_questions,
            "status": a.status,
            "started_at": a.started_at.isoformat() if a.started_at else None,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
        }
        for a in items
    ]


@router.get("/{assessment_id}")
def get_session(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = get_assessment_session(db, current_user, assessment_id)
    return {
        "assessment_id": result["assessment_id"],
        "skill_id": result["skill_id"],
        "skill_name": result["skill_name"],
        "status": result["status"],
        "questions": serialize_questions(result["questions"]),
    }


@router.post("/{assessment_id}/submit", response_model=AssessmentResult)
def submit(
    assessment_id: int,
    data: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return submit_assessment(db, current_user, assessment_id, data)


@router.get("/{assessment_id}/result", response_model=AssessmentResult)
def result(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_assessment_result(db, current_user.id, assessment_id)
