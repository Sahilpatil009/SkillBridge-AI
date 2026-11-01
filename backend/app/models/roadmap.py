from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    milestones = relationship("RoadmapMilestone", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapMilestone.order_index")
    career = relationship("Career")

class RoadmapMilestone(Base):
    __tablename__ = "roadmap_milestones"
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    current_proficiency = Column(String(50))
    target_proficiency = Column(String(50), nullable=False)
    gap_status = Column(String(50))
    importance = Column(String(50))
    priority_score = Column(Float, default=0.0)
    estimated_hours = Column(Integer)
    status = Column(String(20), default="not_started")
    order_index = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    roadmap = relationship("Roadmap", back_populates="milestones")
    skill = relationship("Skill")
