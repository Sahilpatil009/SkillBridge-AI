from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.skill_gap_service import get_skill_gap_report

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap"])

@router.get("")
def skill_gap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_skill_gap_report(db, current_user)

@router.post("/recalculate")
def recalculate(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_skill_gap_report(db, current_user)
