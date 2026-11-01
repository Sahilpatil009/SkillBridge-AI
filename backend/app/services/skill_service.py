from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.skill import Skill, SkillCategory, StudentSkill
from app.models.user import User
from app.schemas.skill import StudentSkillAdd
from typing import Optional


def get_all_skills(db: Session, search: str = "", category_id: Optional[int] = None) -> list[Skill]:
    q = db.query(Skill).options(joinedload(Skill.category)).filter(Skill.is_active == True)
    if search:
        q = q.filter(Skill.name.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(Skill.category_id == category_id)
    return q.order_by(Skill.name).all()


def get_skill_by_id(db: Session, skill_id: int) -> Skill:
    skill = (
        db.query(Skill)
        .options(joinedload(Skill.category), joinedload(Skill.topics))
        .filter(Skill.id == skill_id, Skill.is_active == True)
        .first()
    )
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill


def get_all_categories(db: Session) -> list[SkillCategory]:
    return db.query(SkillCategory).order_by(SkillCategory.name).all()


def add_student_skill(db: Session, user: User, data: StudentSkillAdd) -> StudentSkill:
    skill = db.query(Skill).filter(Skill.id == data.skill_id, Skill.is_active == True).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    existing = db.query(StudentSkill).filter(
        StudentSkill.user_id == user.id, StudentSkill.skill_id == data.skill_id
    ).first()
    if existing:
        for k, v in data.model_dump(exclude_unset=True).items():
            if k != "skill_id":
                setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing
    ss = StudentSkill(user_id=user.id, **data.model_dump())
    db.add(ss)
    db.commit()
    db.refresh(ss)
    return ss


def remove_student_skill(db: Session, user: User, skill_id: int) -> None:
    ss = db.query(StudentSkill).filter(StudentSkill.user_id == user.id, StudentSkill.skill_id == skill_id).first()
    if not ss:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not in your list")
    db.delete(ss)
    db.commit()


def get_student_skills(db: Session, user_id: int) -> list[StudentSkill]:
    return (
        db.query(StudentSkill)
        .options(joinedload(StudentSkill.skill).joinedload(Skill.category))
        .filter(StudentSkill.user_id == user_id)
        .all()
    )
