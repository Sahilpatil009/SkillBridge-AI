from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Career(Base):
    __tablename__ = "careers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), unique=True, nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    skill_requirements = relationship("CareerSkillRequirement", back_populates="career", cascade="all, delete-orphan")
    student_targets = relationship("StudentCareerTarget", back_populates="career")


class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"
    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    target_proficiency = Column(String(50), nullable=False)
    importance = Column(String(50), default="important")
    weight = Column(Float, default=1.0)
    notes = Column(Text)
    career = relationship("Career", back_populates="skill_requirements")
    skill = relationship("Skill", back_populates="career_requirements")


class StudentCareerTarget(Base):
    __tablename__ = "student_career_targets"
    __table_args__ = (UniqueConstraint("user_id", "career_id", name="uq_student_career"),)
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("careers.id", ondelete="CASCADE"), nullable=False)
    is_primary = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    career = relationship("Career", back_populates="student_targets")
