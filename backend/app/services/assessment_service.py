from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import Optional
from app.models.assessment import Question, QuestionOption, Assessment, AssessmentAnswer
from app.models.skill import Skill
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentSubmit, AssessmentResult, TopicPerformance, QuestionResult
import random

# Proficiency thresholds - backend-driven, configurable
PROFICIENCY_RULES = [(70, "advanced"), (40, "intermediate"), (0, "beginner")]


def classify_proficiency(score_pct: float) -> str:
    for threshold, level in PROFICIENCY_RULES:
        if score_pct >= threshold:
            return level
    return "beginner"


def get_questions_for_skill(db: Session, skill_id: int, exclude_ids: list = [], limit: int = 10) -> list:
    q = (
        db.query(Question)
        .options(joinedload(Question.options), joinedload(Question.topic))
        .filter(Question.skill_id == skill_id, Question.is_active == True)
    )
    if exclude_ids:
        q = q.filter(~Question.id.in_(exclude_ids))
    questions = q.all()
    if len(questions) < limit:
        # fallback: allow repeats if not enough unique questions
        questions = (
            db.query(Question)
            .options(joinedload(Question.options), joinedload(Question.topic))
            .filter(Question.skill_id == skill_id, Question.is_active == True)
            .all()
        )
    random.shuffle(questions)
    return questions[:limit]


def get_recent_question_ids(db: Session, user_id: int, skill_id: int) -> list:
    recent = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.skill_id == skill_id, Assessment.status == "submitted")
        .order_by(Assessment.submitted_at.desc())
        .limit(2)
        .all()
    )
    ids = []
    for a in recent:
        ids.extend([ans.question_id for ans in a.answers])
    return list(set(ids))


def serialize_questions(questions: list) -> list[dict]:
    serialized = []
    for q in questions:
        options = [{"id": o.id, "text": o.text, "order_index": o.order_index} for o in q.options]
        random.shuffle(options)
        serialized.append(
            {
                "id": q.id,
                "text": q.text,
                "difficulty": q.difficulty,
                "skill_id": q.skill_id,
                "topic_id": q.topic_id,
                "options": options,
            }
        )
    return serialized


def get_assessment_session(db: Session, user: User, assessment_id: int) -> dict:
    assessment = (
        db.query(Assessment)
        .options(joinedload(Assessment.skill))
        .filter(Assessment.id == assessment_id, Assessment.user_id == user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.status == "submitted":
        raise HTTPException(status_code=400, detail="Assessment already submitted")
    questions = get_questions_for_skill(db, assessment.skill_id)
    if not questions:
        raise HTTPException(status_code=400, detail="No questions available for this skill yet")
    return {
        "assessment_id": assessment.id,
        "skill_id": assessment.skill_id,
        "skill_name": assessment.skill.name if assessment.skill else "",
        "status": assessment.status,
        "questions": questions,
    }


def create_assessment(db: Session, user: User, data: AssessmentCreate) -> dict:
    skill = db.query(Skill).filter(Skill.id == data.skill_id, Skill.is_active == True).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    # Return existing in-progress assessment if any
    in_progress = db.query(Assessment).filter(
        Assessment.user_id == user.id,
        Assessment.skill_id == data.skill_id,
        Assessment.status == "in_progress",
    ).first()
    if in_progress:
        questions = get_questions_for_skill(db, data.skill_id)
        return {"assessment_id": in_progress.id, "skill_id": data.skill_id, "questions": questions, "status": "in_progress"}
    exclude_ids = get_recent_question_ids(db, user.id, data.skill_id)
    questions = get_questions_for_skill(db, data.skill_id, exclude_ids)
    if not questions:
        raise HTTPException(status_code=400, detail="No questions available for this skill yet")
    assessment = Assessment(user_id=user.id, skill_id=data.skill_id, total_questions=len(questions))
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"assessment_id": assessment.id, "skill_id": data.skill_id, "questions": questions, "status": "in_progress"}


def submit_assessment(db: Session, user: User, assessment_id: int, data: AssessmentSubmit) -> AssessmentResult:
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id, Assessment.user_id == user.id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.status == "submitted":
        raise HTTPException(status_code=400, detail="Assessment already submitted")
    # Validate all submitted question IDs belong to this skill
    submitted_qids = {a.question_id for a in data.answers}
    valid_questions = db.query(Question).filter(
        Question.skill_id == assessment.skill_id, Question.id.in_(submitted_qids)
    ).all()
    valid_qid_set = {q.id for q in valid_questions}
    invalid = submitted_qids - valid_qid_set
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid question IDs: {invalid}")
    # Backend-only scoring
    correct_count = 0
    topic_map: dict = {}
    question_results = []
    for ans in data.answers:
        question = next((q for q in valid_questions if q.id == ans.question_id), None)
        if not question:
            continue
        correct_option = next((o for o in question.options if o.is_correct), None)
        is_correct = (
            ans.selected_option_id is not None
            and correct_option is not None
            and ans.selected_option_id == correct_option.id
        )
        if is_correct:
            correct_count += 1
        db.add(AssessmentAnswer(
            assessment_id=assessment.id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id,
            is_correct=is_correct,
        ))
        topic_name = question.topic.name if question.topic else "General"
        if topic_name not in topic_map:
            topic_map[topic_name] = {"correct": 0, "total": 0}
        topic_map[topic_name]["total"] += 1
        if is_correct:
            topic_map[topic_name]["correct"] += 1
        question_results.append(QuestionResult(
            question_id=question.id,
            question_text=question.text,
            selected_option_id=ans.selected_option_id,
            correct_option_id=correct_option.id if correct_option else 0,
            is_correct=is_correct,
            explanation=question.explanation,
            topic_name=question.topic.name if question.topic else None,
        ))
    total = len(data.answers)
    score_pct = round((correct_count / total) * 100, 2) if total > 0 else 0.0
    proficiency = classify_proficiency(score_pct)
    assessment.status = "submitted"
    assessment.score_percentage = score_pct
    assessment.correct_count = correct_count
    assessment.total_questions = total
    assessment.proficiency_level = proficiency
    assessment.submitted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assessment)
    return AssessmentResult(
        id=assessment.id,
        skill_id=assessment.skill_id,
        skill_name=assessment.skill.name if assessment.skill else "",
        score_percentage=score_pct,
        correct_count=correct_count,
        total_questions=total,
        proficiency_level=proficiency,
        submitted_at=assessment.submitted_at,
        topic_performance=[
            TopicPerformance(
                topic_name=t, correct=v["correct"], total=v["total"],
                percentage=round((v["correct"] / v["total"]) * 100, 1) if v["total"] else 0,
            ) for t, v in topic_map.items()
        ],
        question_results=question_results,
    )


def get_assessment_history(db: Session, user_id: int, skill_id: Optional[int] = None) -> list:
    q = db.query(Assessment).options(joinedload(Assessment.skill)).filter(Assessment.user_id == user_id)
    if skill_id:
        q = q.filter(Assessment.skill_id == skill_id)
    return q.order_by(Assessment.started_at.desc()).all()


def get_assessment_result(db: Session, user_id: int, assessment_id: int) -> AssessmentResult:
    assessment = (
        db.query(Assessment)
        .options(
            joinedload(Assessment.answers).joinedload(AssessmentAnswer.question).joinedload(Question.options),
            joinedload(Assessment.answers).joinedload(AssessmentAnswer.question).joinedload(Question.topic),
            joinedload(Assessment.answers).joinedload(AssessmentAnswer.selected_option),
            joinedload(Assessment.skill),
        )
        .filter(Assessment.id == assessment_id, Assessment.user_id == user_id, Assessment.status == "submitted")
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment result not found")
    topic_map: dict = {}
    question_results = []
    for ans in assessment.answers:
        q = ans.question
        correct_option = next((o for o in q.options if o.is_correct), None)
        topic_name = q.topic.name if q.topic else "General"
        if topic_name not in topic_map:
            topic_map[topic_name] = {"correct": 0, "total": 0}
        topic_map[topic_name]["total"] += 1
        if ans.is_correct:
            topic_map[topic_name]["correct"] += 1
        question_results.append(QuestionResult(
            question_id=q.id,
            question_text=q.text,
            selected_option_id=ans.selected_option_id,
            correct_option_id=correct_option.id if correct_option else 0,
            is_correct=ans.is_correct,
            explanation=q.explanation,
            topic_name=q.topic.name if q.topic else None,
        ))
    return AssessmentResult(
        id=assessment.id,
        skill_id=assessment.skill_id,
        skill_name=assessment.skill.name,
        score_percentage=assessment.score_percentage or 0.0,
        correct_count=assessment.correct_count or 0,
        total_questions=assessment.total_questions or 0,
        proficiency_level=assessment.proficiency_level or "beginner",
        submitted_at=assessment.submitted_at,
        topic_performance=[
            TopicPerformance(
                topic_name=t, correct=v["correct"], total=v["total"],
                percentage=round((v["correct"] / v["total"]) * 100, 1) if v["total"] else 0,
            ) for t, v in topic_map.items()
        ],
        question_results=question_results,
    )
