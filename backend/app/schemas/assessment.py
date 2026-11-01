from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuestionOptionOut(BaseModel):
    id: int
    text: str
    order_index: int
    # NOTE: is_correct is intentionally excluded - never expose before submission
    model_config = {"from_attributes": True}


class QuestionOut(BaseModel):
    id: int
    text: str
    difficulty: str
    skill_id: int
    topic_id: Optional[int] = None
    options: List[QuestionOptionOut] = []
    model_config = {"from_attributes": True}


class AssessmentCreate(BaseModel):
    skill_id: int


class AnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None


class AssessmentSubmit(BaseModel):
    answers: List[AnswerSubmit]


class TopicPerformance(BaseModel):
    topic_name: str
    correct: int
    total: int
    percentage: float


class QuestionResult(BaseModel):
    question_id: int
    question_text: str
    selected_option_id: Optional[int]
    correct_option_id: int
    is_correct: bool
    explanation: Optional[str]
    topic_name: Optional[str]


class AssessmentResult(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    score_percentage: float
    correct_count: int
    total_questions: int
    proficiency_level: str
    submitted_at: Optional[datetime]
    topic_performance: List[TopicPerformance] = []
    question_results: List[QuestionResult] = []
