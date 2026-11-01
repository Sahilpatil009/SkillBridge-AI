from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SkillBrief(BaseModel):
    id: int
    name: str
    slug: str
    model_config = {"from_attributes": True}


class CareerSkillRequirementOut(BaseModel):
    skill_id: int
    skill: SkillBrief
    target_proficiency: str
    importance: str
    weight: float
    notes: Optional[str] = None
    model_config = {"from_attributes": True}


class CareerOut(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    responsibilities: Optional[str] = None
    is_active: bool
    model_config = {"from_attributes": True}


class CareerDetailOut(CareerOut):
    skill_requirements: List[CareerSkillRequirementOut] = []
    model_config = {"from_attributes": True}


class CareerTargetSet(BaseModel):
    career_id: int
