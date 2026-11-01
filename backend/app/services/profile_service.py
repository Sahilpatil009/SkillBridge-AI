from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.profile import ProfileUpdate, UserUpdate


def get_or_create_profile(db: Session, user: User) -> StudentProfile:
    if user.profile:
        return user.profile
    profile = StudentProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_profile(db: Session, user: User, data: ProfileUpdate) -> StudentProfile:
    profile = get_or_create_profile(db, user)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def get_profile_completion(user: User) -> dict:
    profile = user.profile
    fields = ["college", "degree", "branch", "year_of_study", "career_interests",
              "learning_format", "career_goal", "bio"]
    filled = sum(1 for f in fields if profile and getattr(profile, f))
    total = len(fields)
    return {
        "completed_fields": filled,
        "total_fields": total,
        "percentage": round((filled / total) * 100) if total else 0,
    }
