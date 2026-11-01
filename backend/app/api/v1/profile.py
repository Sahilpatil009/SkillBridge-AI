from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.profile import ProfileUpdate, UserProfileOut, UserUpdate
from app.services.profile_service import update_profile, get_or_create_profile, update_user, get_profile_completion

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=UserProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    get_or_create_profile(db, current_user)
    db.refresh(current_user)
    return current_user


@router.put("", response_model=UserProfileOut)
def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_profile(db, current_user, data)
    db.refresh(current_user)
    return current_user


@router.patch("/user", response_model=UserProfileOut)
def update_user_info(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_user(db, current_user, data)
    db.refresh(current_user)
    return current_user


@router.get("/completion")
def profile_completion(current_user: User = Depends(get_current_user)):
    return get_profile_completion(current_user)
