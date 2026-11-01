from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.career import Career, CareerSkillRequirement, StudentCareerTarget
from app.models.user import User
from app.schemas.career import CareerTargetSet


def get_all_careers(db: Session, search: str = "") -> list[Career]:
    q = db.query(Career).filter(Career.is_active == True)
    if search:
        q = q.filter(Career.title.ilike(f"%{search}%"))
    return q.order_by(Career.title).all()


def get_career_by_id(db: Session, career_id: int) -> Career:
    career = (
        db.query(Career)
        .options(joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill))
        .filter(Career.id == career_id, Career.is_active == True)
        .first()
    )
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career not found")
    return career


def set_target_career(db: Session, user: User, data: CareerTargetSet) -> StudentCareerTarget:
    career = db.query(Career).filter(Career.id == data.career_id, Career.is_active == True).first()
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career not found")
    db.query(StudentCareerTarget).filter(StudentCareerTarget.user_id == user.id).update({"is_primary": False})
    existing = db.query(StudentCareerTarget).filter(
        StudentCareerTarget.user_id == user.id, StudentCareerTarget.career_id == data.career_id
    ).first()
    if existing:
        existing.is_primary = True
        db.commit()
        db.refresh(existing)
        return existing
    target = StudentCareerTarget(user_id=user.id, career_id=data.career_id, is_primary=True)
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


def get_target_career(db: Session, user_id: int):
    return (
        db.query(StudentCareerTarget)
        .options(joinedload(StudentCareerTarget.career))
        .filter(StudentCareerTarget.user_id == user_id, StudentCareerTarget.is_primary == True)
        .first()
    )
