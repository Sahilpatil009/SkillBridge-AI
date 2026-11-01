from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, PasswordChange
from app.schemas.profile import UserProfileOut
from app.services.auth_service import register_user, login_user
from app.core.deps import get_current_user
from app.core.security import verify_password, get_password_hash
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user, token = register_user(db, data)
    user_out = UserOut(
        id=user.id or 0,
        name=user.name,
        email=user.email,
        role=str(user.role.value if hasattr(user.role, "value") else user.role) if user.role else "student",
        is_active=user.is_active if user.is_active is not None else True,
        created_at=user.created_at or datetime.now(timezone.utc),
    )
    return TokenResponse(access_token=token, user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user, token = login_user(db, data)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserProfileOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
