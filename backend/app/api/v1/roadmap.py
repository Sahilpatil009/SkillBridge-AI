from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.roadmap import RoadmapOut, MilestoneUpdate, MilestoneOut
from app.services.roadmap_service import generate_roadmap, get_roadmap, update_milestone

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.get("")
def get_my_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = get_roadmap(db, current_user.id)
    if not roadmap:
        return {"roadmap": None, "message": "No roadmap yet. POST /roadmap/generate to create one."}
    return roadmap

@router.post("/generate", response_model=RoadmapOut)
def generate_my_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return generate_roadmap(db, current_user)

@router.patch("/milestones/{milestone_id}", response_model=MilestoneOut)
def update_milestone_status(milestone_id: int, data: MilestoneUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_milestone(db, current_user.id, milestone_id, data)
