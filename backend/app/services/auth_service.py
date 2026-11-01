from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.profile import StudentProfile
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token


def register_user(db: Session, data: UserRegister) -> tuple[User, str]:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=UserRole.student,
        is_active=True,
    )
    db.add(user)
    db.flush()
    # Ensure created_at is set (server_default is not applied in mock DB tests)
    if user.created_at is None:
        user.created_at = datetime.now(timezone.utc)
    profile = StudentProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return user, token


def login_user(db: Session, data: UserLogin) -> tuple[User, str]:
    user = db.query(User).filter(User.email == data.email, User.is_active == True).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return user, token
