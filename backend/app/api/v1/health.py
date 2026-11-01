from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.base import get_db
from app.schemas.common import HealthCheck

router = APIRouter()


@router.get("/health", response_model=HealthCheck, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return HealthCheck(status="ok", version="1.0.0", database=db_status)
