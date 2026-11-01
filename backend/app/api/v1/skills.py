from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.skill import SkillOut, SkillDetailOut, SkillCategoryOut, StudentSkillAdd, StudentSkillOut
from app.services.skill_service import get_all_skills, get_skill_by_id, get_all_categories, add_student_skill, remove_student_skill, get_student_skills

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("/categories", response_model=List[SkillCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return get_all_categories(db)


@router.get("", response_model=List[SkillOut])
def list_skills(
    search: str = Query(""),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return get_all_skills(db, search, category_id)


@router.get("/mine", response_model=List[StudentSkillOut])
def my_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_student_skills(db, current_user.id)


@router.post("/mine", response_model=StudentSkillOut, status_code=201)
def add_my_skill(data: StudentSkillAdd, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return add_student_skill(db, current_user, data)


@router.delete("/mine/{skill_id}", status_code=204)
def remove_my_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    remove_student_skill(db, current_user, skill_id)


@router.get("/{skill_id}", response_model=SkillDetailOut)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    return get_skill_by_id(db, skill_id)
