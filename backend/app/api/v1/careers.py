from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.career import CareerOut, CareerDetailOut, CareerTargetSet
from app.services.career_service import get_all_careers, get_career_by_id, set_target_career, get_target_career

router = APIRouter(prefix="/careers", tags=["Careers"])


@router.get("", response_model=List[CareerOut])
def list_careers(search: str = Query(""), db: Session = Depends(get_db)):
    return get_all_careers(db, search)


@router.get("/target")
def get_my_target_career(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target = get_target_career(db, current_user.id)
    if not target:
        return {"target": None}
    return {"target": {"career_id": target.career_id, "career_title": target.career.title, "is_primary": target.is_primary}}


@router.put("/target")
def set_my_target_career(data: CareerTargetSet, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target = set_target_career(db, current_user, data)
    return {"message": "Target career set", "career_id": target.career_id}


@router.get("/{career_id}", response_model=CareerDetailOut)
def get_career(career_id: int, db: Session = Depends(get_db)):
    return get_career_by_id(db, career_id)
