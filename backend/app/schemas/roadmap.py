from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MilestoneUpdate(BaseModel):
    status: Optional[str] = None

class MilestoneOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    title: str
    description: Optional[str] = None
    current_proficiency: Optional[str] = None
    target_proficiency: str
    gap_status: Optional[str] = None
    importance: Optional[str] = None
    priority_score: float
    estimated_hours: Optional[int] = None
    status: str
    order_index: int
    completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class RoadmapOut(BaseModel):
    id: int
    career_id: int
    career_title: str
    version: int
    status: str
    created_at: datetime
    updated_at: datetime
    milestones: List[MilestoneOut] = []
    total_milestones: int
    completed_milestones: int
    estimated_remaining_hours: Optional[int] = None
