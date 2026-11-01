import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User

SAMPLE_RESUME = """
Jane Doe
Software Engineer
Email: jane@example.com | GitHub: github.com/janedoe

SUMMARY
Experienced software engineer with expertise in Python, SQL, and Docker.

EXPERIENCE
Software Developer | Tech Corp
• Architected RESTful microservices with FastAPI and Python, improving performance by 30%.
• Optimized SQL database queries across 20+ tables.
• Automated deployments using Docker.

PROJECTS
Task Manager App
• Built a task management system using Python and Docker.
"""


@pytest.fixture
def test_client():
    mock_user = MagicMock(spec=User)
    mock_user.id = 1
    mock_user.name = "Jane Doe"
    mock_user.email = "jane@example.com"

    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.all.return_value = []
    mock_db.query.return_value.options.return_value.filter.return_value.first.return_value = None

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_resume_score_unauthorized():
    client = TestClient(app)
    res = client.post("/api/v1/resume/score", json={"resume_text": SAMPLE_RESUME})
    assert res.status_code == 401


def test_resume_score_authenticated(test_client):
    res = test_client.post(
        "/api/v1/resume/score",
        json={"resume_text": SAMPLE_RESUME},
    )
    assert res.status_code == 200
    data = res.json()
    assert "overall_score" in data
    assert "grade" in data
    assert "breakdown" in data
    assert "actionable_tips" in data
    assert data["overall_score"] > 0


def test_resume_score_too_short(test_client):
    res = test_client.post(
        "/api/v1/resume/score",
        json={"resume_text": "Short"},
    )
    assert res.status_code == 400
