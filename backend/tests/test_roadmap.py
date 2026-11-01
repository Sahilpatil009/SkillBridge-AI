from app.services.roadmap_service import _estimate_hours

def test_estimate_beginner_to_intermediate():
    assert _estimate_hours("beginner", "intermediate") == 40

def test_estimate_beginner_to_advanced():
    assert _estimate_hours("beginner", "advanced") == 100

def test_estimate_intermediate_to_advanced():
    assert _estimate_hours("intermediate", "advanced") == 50

def test_estimate_none_to_intermediate():
    h = _estimate_hours(None, "intermediate")
    assert isinstance(h, int) and h > 0

def test_estimate_unknown_returns_int():
    h = _estimate_hours("advanced", "advanced")
    assert isinstance(h, int)
