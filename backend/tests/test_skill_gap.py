from app.services.skill_gap_service import (
    compute_gap_status, compute_priority_score,
    STATUS_TARGET_MET, STATUS_NEEDS_IMPROVEMENT, STATUS_CRITICAL_GAP, STATUS_NOT_ASSESSED,
)

def test_not_assessed_when_no_proficiency():
    assert compute_gap_status(None, "advanced", "critical") == STATUS_NOT_ASSESSED

def test_not_assessed_important():
    assert compute_gap_status(None, "intermediate", "important") == STATUS_NOT_ASSESSED

def test_target_met_equal():
    assert compute_gap_status("intermediate", "intermediate", "important") == STATUS_TARGET_MET

def test_target_met_above():
    assert compute_gap_status("advanced", "intermediate", "critical") == STATUS_TARGET_MET

def test_critical_gap():
    assert compute_gap_status("beginner", "advanced", "critical") == STATUS_CRITICAL_GAP

def test_critical_gap_one_level():
    assert compute_gap_status("intermediate", "advanced", "critical") == STATUS_CRITICAL_GAP

def test_needs_improvement_important():
    assert compute_gap_status("beginner", "intermediate", "important") == STATUS_NEEDS_IMPROVEMENT

def test_needs_improvement_nice_to_have():
    assert compute_gap_status("beginner", "advanced", "nice_to_have") == STATUS_NEEDS_IMPROVEMENT

def test_priority_target_met_zero():
    assert compute_priority_score(STATUS_TARGET_MET, "critical", 1.0) == 0.0

def test_priority_critical_highest():
    assert compute_priority_score(STATUS_CRITICAL_GAP, "critical", 1.0) > compute_priority_score(STATUS_NEEDS_IMPROVEMENT, "critical", 1.0)

def test_priority_not_assessed_above_target_met():
    assert compute_priority_score(STATUS_NOT_ASSESSED, "important", 1.0) > compute_priority_score(STATUS_TARGET_MET, "important", 1.0)

def test_priority_importance_multiplier():
    assert compute_priority_score(STATUS_CRITICAL_GAP, "critical", 1.0) > compute_priority_score(STATUS_CRITICAL_GAP, "nice_to_have", 1.0)
