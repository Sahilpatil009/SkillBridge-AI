from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.models.career import Career, CareerSkillRequirement, StudentCareerTarget
from app.models.assessment import Assessment
from app.models.user import User

STATUS_TARGET_MET = "target_met"
STATUS_NEEDS_IMPROVEMENT = "needs_improvement"
STATUS_CRITICAL_GAP = "critical_gap"
STATUS_NOT_ASSESSED = "not_assessed"
PROFICIENCY_ORDER = {"beginner": 1, "intermediate": 2, "advanced": 3}


def get_latest_proficiency(db: Session, user_id: int, skill_id: int) -> Optional[str]:
    latest = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.skill_id == skill_id, Assessment.status == "submitted")
        .order_by(Assessment.submitted_at.desc())
        .first()
    )
    return latest.proficiency_level if latest else None


def compute_gap_status(current_proficiency: Optional[str], target_proficiency: str, importance: str) -> str:
    if current_proficiency is None:
        return STATUS_NOT_ASSESSED
    current_rank = PROFICIENCY_ORDER.get(current_proficiency, 0)
    target_rank = PROFICIENCY_ORDER.get(target_proficiency, 0)
    if current_rank >= target_rank:
        return STATUS_TARGET_MET
    gap = target_rank - current_rank
    if importance == "critical" and gap >= 1:
        return STATUS_CRITICAL_GAP
    return STATUS_NEEDS_IMPROVEMENT


def compute_priority_score(gap_status: str, importance: str, weight: float) -> float:
    status_scores = {STATUS_CRITICAL_GAP: 100, STATUS_NEEDS_IMPROVEMENT: 50, STATUS_NOT_ASSESSED: 30, STATUS_TARGET_MET: 0}
    importance_multipliers = {"critical": 3.0, "important": 2.0, "nice_to_have": 1.0}
    base = status_scores.get(gap_status, 0)
    multiplier = importance_multipliers.get(importance, 1.0)
    return round(base * multiplier * weight, 2)


def get_skill_gap_report(db: Session, user: User) -> dict:
    target = (
        db.query(StudentCareerTarget)
        .options(
            joinedload(StudentCareerTarget.career)
            .joinedload(Career.skill_requirements)
            .joinedload(CareerSkillRequirement.skill)
        )
        .filter(StudentCareerTarget.user_id == user.id, StudentCareerTarget.is_primary == True)
        .first()
    )
    if not target:
        return {
            "has_target_career": False, "career": None,
            "summary": {"total_required": 0, "target_met": 0, "needs_improvement": 0, "critical_gaps": 0, "not_assessed": 0},
            "skill_gaps": [],
        }
    career = target.career
    requirements = career.skill_requirements
    skill_gaps = []
    summary = {"total_required": 0, "target_met": 0, "needs_improvement": 0, "critical_gaps": 0, "not_assessed": 0}
    for req in requirements:
        current_proficiency = get_latest_proficiency(db, user.id, req.skill_id)
        gap_status = compute_gap_status(current_proficiency, req.target_proficiency, req.importance)
        priority_score = compute_priority_score(gap_status, req.importance, req.weight)
        summary["total_required"] += 1
        if gap_status == STATUS_TARGET_MET: summary["target_met"] += 1
        elif gap_status == STATUS_NEEDS_IMPROVEMENT: summary["needs_improvement"] += 1
        elif gap_status == STATUS_CRITICAL_GAP: summary["critical_gaps"] += 1
        elif gap_status == STATUS_NOT_ASSESSED: summary["not_assessed"] += 1
        if gap_status == STATUS_TARGET_MET:
            action = "Maintain and deepen knowledge"
        elif gap_status == STATUS_NOT_ASSESSED:
            action = f"Take the {req.skill.name} assessment to measure your level"
        elif gap_status == STATUS_CRITICAL_GAP:
            action = f"Focus on {req.skill.name} — critical gap vs. {req.target_proficiency} target"
        else:
            action = f"Improve {req.skill.name} from {current_proficiency} toward {req.target_proficiency}"
        skill_gaps.append({
            "skill_id": req.skill_id, "skill_name": req.skill.name, "skill_slug": req.skill.slug,
            "current_proficiency": current_proficiency, "target_proficiency": req.target_proficiency,
            "importance": req.importance, "weight": req.weight,
            "gap_status": gap_status, "priority_score": priority_score, "recommended_action": action,
        })
    skill_gaps.sort(key=lambda x: x["priority_score"], reverse=True)
    return {
        "has_target_career": True,
        "career": {"id": career.id, "title": career.title, "slug": career.slug},
        "summary": summary, "skill_gaps": skill_gaps,
    }
