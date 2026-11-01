from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("skill_topics.id"), nullable=True)
    text = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False, default="intermediate")
    explanation = Column(Text)
    reference_url = Column(String(500))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    skill = relationship("Skill")
    topic = relationship("SkillTopic")
    assessment_answers = relationship("AssessmentAnswer", back_populates="question")


class QuestionOption(Base):
    __tablename__ = "question_options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, default=0)
    question = relationship("Question", back_populates="options")


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    status = Column(String(20), default="in_progress")
    score_percentage = Column(Float)
    correct_count = Column(Integer)
    total_questions = Column(Integer)
    proficiency_level = Column(String(50))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True))
    skill = relationship("Skill")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("question_options.id"), nullable=True)
    is_correct = Column(Boolean)
    assessment = relationship("Assessment", back_populates="answers")
    question = relationship("Question", back_populates="assessment_answers")
    selected_option = relationship("QuestionOption")
