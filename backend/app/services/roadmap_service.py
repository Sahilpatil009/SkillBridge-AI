from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import Optional
from app.models.roadmap import Roadmap, RoadmapMilestone
from app.models.user import User
from app.schemas.roadmap import MilestoneUpdate, RoadmapOut, MilestoneOut
from app.services.skill_gap_service import get_skill_gap_report, STATUS_TARGET_MET

HOURS_ESTIMATE = {
    ("beginner", "intermediate"): 40, ("beginner", "advanced"): 100,
    ("intermediate", "advanced"): 50, ("not_assessed", "beginner"): 20,
    ("not_assessed", "intermediate"): 60, ("not_assessed", "advanced"): 120,
}

def _estimate_hours(current: Optional[str], target: str) -> int:
    return HOURS_ESTIMATE.get((current or "not_assessed", target), 30)

def generate_roadmap(db: Session, user: User) -> RoadmapOut:
    gap_report = get_skill_gap_report(db, user)
    if not gap_report["has_target_career"]:
        raise HTTPException(status_code=400, detail="Please select a target career before generating a roadmap.")
    career_id = gap_report["career"]["id"]
    existing = db.query(Roadmap).filter(Roadmap.user_id == user.id, Roadmap.status == "active").first()
    completed_skill_ids: set = set()
    if existing:
        for m in existing.milestones:
            if m.status == "completed":
                completed_skill_ids.add(m.skill_id)
        existing.status = "archived"
        db.flush()
    version = (existing.version + 1) if existing else 1
    roadmap = Roadmap(user_id=user.id, career_id=career_id, version=version)
    db.add(roadmap)
    db.flush()
    for order, gap in enumerate(gap_report["skill_gaps"]):
        is_target_met = gap["gap_status"] == STATUS_TARGET_MET
        already_completed = gap["skill_id"] in completed_skill_ids

        if is_target_met and not already_completed:
            # Target met — include as an "advance further" milestone rather than skipping
            next_level_map = {"beginner": "intermediate", "intermediate": "advanced", "advanced": "advanced"}
            current = gap["current_proficiency"] or "intermediate"
            advanced_target = next_level_map.get(gap["target_proficiency"], "advanced")
            est_hours = _estimate_hours(gap["target_proficiency"], advanced_target)
            db.add(RoadmapMilestone(
                roadmap_id=roadmap.id, skill_id=gap["skill_id"],
                title=f"Advance {gap['skill_name']} to expert level (target already met)",
                description=(
                    f"You've already reached the {gap['target_proficiency']} target for {gap['skill_name']}. "
                    f"Push further — explore advanced patterns, design principles, performance optimisation, "
                    f"and real-world production-grade applications to become an expert."
                ),
                current_proficiency=gap["target_proficiency"],
                target_proficiency=advanced_target,
                gap_status=gap["gap_status"],
                importance=gap["importance"], priority_score=gap["priority_score"],
                estimated_hours=est_hours, status="not_started", order_index=order,
                completed_at=None,
            ))
            continue

        est_hours = _estimate_hours(gap["current_proficiency"], gap["target_proficiency"])
        milestone_status = "completed" if already_completed else "not_started"
        db.add(RoadmapMilestone(
            roadmap_id=roadmap.id, skill_id=gap["skill_id"],
            title=f"Learn {gap['skill_name']} to {gap['target_proficiency']} level",
            description=gap["recommended_action"], current_proficiency=gap["current_proficiency"],
            target_proficiency=gap["target_proficiency"], gap_status=gap["gap_status"],
            importance=gap["importance"], priority_score=gap["priority_score"],
            estimated_hours=est_hours, status=milestone_status, order_index=order,
            completed_at=datetime.now(timezone.utc) if milestone_status == "completed" else None,
        ))
    db.commit()
    db.refresh(roadmap)
    return _roadmap_to_out(roadmap)

def get_roadmap(db: Session, user_id: int) -> Optional[RoadmapOut]:
    roadmap = (
        db.query(Roadmap)
        .options(joinedload(Roadmap.milestones).joinedload(RoadmapMilestone.skill), joinedload(Roadmap.career))
        .filter(Roadmap.user_id == user_id, Roadmap.status == "active")
        .order_by(Roadmap.version.desc()).first()
    )
    return _roadmap_to_out(roadmap) if roadmap else None

def update_milestone(db: Session, user_id: int, milestone_id: int, data: MilestoneUpdate) -> MilestoneOut:
    milestone = (
        db.query(RoadmapMilestone).join(Roadmap)
        .filter(RoadmapMilestone.id == milestone_id, Roadmap.user_id == user_id).first()
    )
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    if data.status:
        if data.status not in {"not_started", "in_progress", "completed"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        milestone.status = data.status
        if data.status == "completed" and not milestone.completed_at:
            milestone.completed_at = datetime.now(timezone.utc)
        elif data.status != "completed":
            milestone.completed_at = None
    db.commit()
    db.refresh(milestone)
    return _milestone_to_out(milestone)

def _milestone_to_out(m: RoadmapMilestone) -> MilestoneOut:
    return MilestoneOut(
        id=m.id, skill_id=m.skill_id, skill_name=m.skill.name if m.skill else "",
        title=m.title, description=m.description, current_proficiency=m.current_proficiency,
        target_proficiency=m.target_proficiency, gap_status=m.gap_status, importance=m.importance,
        priority_score=m.priority_score or 0.0, estimated_hours=m.estimated_hours,
        status=m.status, order_index=m.order_index, completed_at=m.completed_at,
    )

def _roadmap_to_out(roadmap: Roadmap) -> RoadmapOut:
    milestones = [_milestone_to_out(m) for m in (roadmap.milestones or [])]
    completed = sum(1 for m in milestones if m.status == "completed")
    remaining_hours = sum((m.estimated_hours or 0) for m in milestones if m.status != "completed")
    return RoadmapOut(
        id=roadmap.id, career_id=roadmap.career_id,
        career_title=roadmap.career.title if roadmap.career else "",
        version=roadmap.version, status=roadmap.status,
        created_at=roadmap.created_at, updated_at=roadmap.updated_at,
        milestones=milestones, total_milestones=len(milestones),
        completed_milestones=completed,
        estimated_remaining_hours=remaining_hours if remaining_hours > 0 else None,
    )
