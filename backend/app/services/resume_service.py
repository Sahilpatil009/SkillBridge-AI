import re
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.models.career import Career, CareerSkillRequirement, StudentCareerTarget
from app.models.skill import Skill
from app.models.user import User

ACTION_VERBS = {
    "architected", "developed", "engineered", "built", "designed", "implemented",
    "optimized", "deployed", "automated", "spearheaded", "refactored", "migrated",
    "reduced", "increased", "accelerated", "scaled", "created", "integrated",
    "led", "orchestrated", "streamlined", "configured", "debugged", "monitored"
}

SECTIONS = {
    "experience": ["experience", "work experience", "employment history", "professional experience"],
    "projects": ["projects", "personal projects", "academic projects", "technical projects"],
    "skills": ["skills", "technical skills", "technologies", "tech stack", "competencies"],
    "education": ["education", "academic background", "academics", "qualifications"],
    "contact": ["email", "github", "linkedin", "phone", "portfolio"],
}


def analyze_resume(db: Session, user: User, resume_text: str, career_id: Optional[int] = None) -> dict:
    text_lower = resume_text.lower()
    word_count = len(re.findall(r"\b\w+\b", resume_text))

    # 1. Determine Target Career
    target_career = None
    if career_id:
        target_career = (
            db.query(Career)
            .options(joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill))
            .filter(Career.id == career_id, Career.is_active == True)
            .first()
        )
    if not target_career:
        target_rec = (
            db.query(StudentCareerTarget)
            .options(joinedload(StudentCareerTarget.career).joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill))
            .filter(StudentCareerTarget.user_id == user.id, StudentCareerTarget.is_primary == True)
            .first()
        )
        if target_rec:
            target_career = target_rec.career

    if not target_career:
        target_career = (
            db.query(Career)
            .options(joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill))
            .filter(Career.is_active == True)
            .first()
        )

    # 2. Extract Skills
    all_db_skills = db.query(Skill).filter(Skill.is_active == True).all()
    detected_skills = []
    for s in all_db_skills:
        name_lower = s.name.lower()
        # Word boundary or exact substring check
        pattern = r"\b" + re.escape(name_lower) + r"\b"
        if re.search(pattern, text_lower):
            detected_skills.append(s.name)

    # Required skills for target career
    required_skills = []
    missing_skills = []
    matched_skills = []

    if target_career and target_career.skill_requirements:
        for req in target_career.skill_requirements:
            s_name = req.skill.name
            required_skills.append({
                "name": s_name,
                "importance": req.importance,
                "target_proficiency": req.target_proficiency,
            })
            pattern = r"\b" + re.escape(s_name.lower()) + r"\b"
            if re.search(pattern, text_lower):
                matched_skills.append(s_name)
            else:
                missing_skills.append({
                    "name": s_name,
                    "importance": req.importance,
                    "target_proficiency": req.target_proficiency,
                })

    # 3. Action Verbs & Quantifiable Metrics
    verbs_found = [v for v in ACTION_VERBS if re.search(r"\b" + v + r"\b", text_lower)]
    metric_matches = re.findall(r"\b(?:\d+%(?: reduction| increase| boost| improvement)?|\$\d+[\w]*|\d+\+? (?:users|requests|ms|seconds|minutes|hours|qps|endpoints|tables|nodes|tests))\b", text_lower)
    number_counts = len(re.findall(r"\b\d+(?:\.\d+)?%?\b", resume_text))

    # 4. Section Structure Checks
    detected_sections = {}
    for sec_key, aliases in SECTIONS.items():
        found = any(alias in text_lower for alias in aliases)
        detected_sections[sec_key] = found

    # Has contact details
    has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", resume_text))
    has_links = bool(re.search(r"(?:github\.com|linkedin\.com|http|https)", text_lower))
    detected_sections["contact"] = has_email or has_links

    # 5. Scoring Computation (0 - 100)
    # A. Skills Match (35%)
    if required_skills:
        skill_ratio = len(matched_skills) / max(len(required_skills), 1)
        skills_score = int(min(100, skill_ratio * 100))
    else:
        skills_score = int(min(100, (len(detected_skills) / 8) * 100))

    # B. Impact & Quantifiable Results (25%)
    verb_score = min(50, len(verbs_found) * 10)
    metrics_score = min(50, (len(metric_matches) * 15) + (min(number_counts, 8) * 4))
    impact_score = int(min(100, verb_score + metrics_score))

    # C. Structure & ATS Formatting (20%)
    present_sections = sum(1 for v in detected_sections.values() if v)
    structure_score = int((present_sections / len(detected_sections)) * 70)
    # Length validation (ideal: 250 - 900 words)
    if 250 <= word_count <= 900:
        structure_score += 30
    elif 150 <= word_count < 250:
        structure_score += 15
    elif word_count > 900:
        structure_score += 15
    else:
        structure_score += 5
    structure_score = min(100, structure_score)

    # D. Experience & Depth (20%)
    depth_score = 40
    if detected_sections.get("projects"):
        depth_score += 25
    if detected_sections.get("experience"):
        depth_score += 25
    if len(detected_skills) >= 6:
        depth_score += 10
    depth_score = min(100, depth_score)

    overall_score = int(round(
        (skills_score * 0.35) +
        (impact_score * 0.25) +
        (structure_score * 0.20) +
        (depth_score * 0.20)
    ))

    # Grade
    if overall_score >= 85:
        grade = "EXCELLENT"
        badge = "badge-green"
    elif overall_score >= 70:
        grade = "COMPETITIVE"
        badge = "badge-green"
    elif overall_score >= 55:
        grade = "NEEDS WORK"
        badge = "badge-yellow"
    else:
        grade = "CRITICAL"
        badge = "badge-red"

    # Strengths
    strengths = []
    if len(matched_skills) >= 4:
        strengths.append(f"Strong alignment with target role: detected {len(matched_skills)} core requirements.")
    if len(verbs_found) >= 4:
        strengths.append(f"Strong action-oriented vocabulary ({', '.join(verbs_found[:4])}).")
    if number_counts >= 3:
        strengths.append("Contains quantifiable results and metrics that recruiters look for.")
    if detected_sections.get("projects"):
        strengths.append("Dedicated technical projects section reinforces hands-on execution.")
    if not strengths:
        strengths.append("Found clear foundational structure and readable technical background.")

    # Actionable Tips
    actionable_tips = []
    if missing_skills:
        top_missing = [m["name"] for m in missing_skills[:4]]
        actionable_tips.append(
            f"Add key missing skills for {target_career.title if target_career else 'your target role'}: {', '.join(top_missing)}."
        )
    if len(verbs_found) < 4:
        actionable_tips.append(
            "Replace passive descriptions with high-impact power verbs (e.g. 'Architected', 'Optimized', 'Automated')."
        )
    if number_counts < 3:
        actionable_tips.append(
            "Quantify your bullet points with the XYZ formula: Accomplished [X], as measured by [Y], by doing [Z] (e.g. 'Reduced API response times by 35%')."
        )
    if not detected_sections.get("contact"):
        actionable_tips.append("Ensure your GitHub and LinkedIn profile URLs are prominently placed at the top.")
    if word_count < 250:
        actionable_tips.append("Expand on key project architectural decisions and tech stacks to improve ATS parsing depth.")

    return {
        "overall_score": overall_score,
        "grade": grade,
        "badge": badge,
        "word_count": word_count,
        "target_career": target_career.title if target_career else "General Tech Role",
        "target_career_id": target_career.id if target_career else None,
        "breakdown": {
            "skills_match": skills_score,
            "impact_metrics": impact_score,
            "ats_structure": structure_score,
            "depth_experience": depth_score,
        },
        "detected_skills": detected_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "action_verbs_found": verbs_found,
        "sections_detected": detected_sections,
        "strengths": strengths,
        "actionable_tips": actionable_tips,
    }
