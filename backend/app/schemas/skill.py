from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SkillCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = {"from_attributes": True}


class SkillTopicOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    order_index: int
    model_config = {"from_attributes": True}


class SkillOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    category: SkillCategoryOut
    is_active: bool
    model_config = {"from_attributes": True}


class SkillDetailOut(SkillOut):
    topics: List[SkillTopicOut] = []
    model_config = {"from_attributes": True}


class StudentSkillAdd(BaseModel):
    skill_id: int
    experience_level: Optional[str] = None
    years_experience: Optional[int] = None
    notes: Optional[str] = None


class StudentSkillOut(BaseModel):
    id: int
    skill_id: int
    skill: SkillOut
    experience_level: Optional[str] = None
    years_experience: Optional[int] = None
    created_at: datetime
    model_config = {"from_attributes": True}
