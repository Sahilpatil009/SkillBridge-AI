from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    college = Column(String(255))
    degree = Column(String(255))
    branch = Column(String(255))
    year_of_study = Column(String(50))
    career_interests = Column(Text)
    learning_format = Column(String(100))
    study_hours_per_week = Column(Integer)
    career_goal = Column(String(100))
    bio = Column(Text)
    github_url = Column(String(500))
    linkedin_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")
