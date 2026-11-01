import pytest
import datetime
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.db.base import get_db
from app.models.assessment import Assessment
from app.models.user import User, UserRole
from app.core.security import get_password_hash, create_access_token


def make_mock_user(user_id=1):
    user = MagicMock(spec=User)
    user.id = user_id
    user.name = "Test"
    user.email = "test@example.com"
    user.hashed_password = get_password_hash("password123")
    user.role = UserRole.student
    user.is_active = True
    user.created_at = datetime.datetime(2026, 1, 1)
    user.profile = None
    return user


@pytest.fixture
def auth_client():
    mock_db = MagicMock()
    user = make_mock_user()
    mock_db.query.return_value.filter.return_value.first.return_value = user
    app.dependency_overrides[get_db] = lambda: mock_db
    token = create_access_token({"sub": "1"})
    client = TestClient(app)
    yield client, mock_db, token
    app.dependency_overrides.clear()


def test_scoring_100_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(100.0) == "advanced"


def test_scoring_75_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(75.0) == "advanced"


def test_scoring_55_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(55.0) == "intermediate"


def test_scoring_30_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(30.0) == "beginner"


def test_scoring_0_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(0.0) == "beginner"


def test_scoring_exactly_40_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(40.0) == "intermediate"


def test_scoring_exactly_70_percent():
    from app.services.assessment_service import classify_proficiency
    assert classify_proficiency(70.0) == "advanced"


def test_submit_already_submitted(auth_client):
    client, mock_db, token = auth_client
    submitted = MagicMock(spec=Assessment)
    submitted.id = 1
    submitted.user_id = 1
    submitted.status = "submitted"
    mock_db.query.return_value.filter.return_value.first.return_value = submitted
    response = client.post(
        "/api/v1/assessments/1/submit",
        json={"answers": []},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "already submitted" in response.json()["detail"].lower()


def test_history_endpoint_returns_list(auth_client):
    client, mock_db, token = auth_client
    mock_db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = []
    response = client.get("/api/v1/assessments/history", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_questions_not_exposed_before_submit():
    from app.schemas.assessment import QuestionOptionOut
    assert "is_correct" not in QuestionOptionOut.model_fields, "is_correct must not be in QuestionOptionOut"


def test_correct_answers_hidden_in_schema():
    from app.schemas.assessment import QuestionOut
    assert "correct_option_id" not in QuestionOut.model_fields
