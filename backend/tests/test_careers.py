import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.db.base import get_db
from app.models.career import Career
from app.models.skill import Skill, SkillCategory


def make_mock_career(id=1, title="Full-Stack Developer", slug="full-stack-developer"):
    c = MagicMock(spec=Career)
    c.id = id
    c.title = title
    c.slug = slug
    c.description = "Build web apps"
    c.responsibilities = "[]"
    c.is_active = True
    c.skill_requirements = []
    return c


@pytest.fixture
def client():
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    c = TestClient(app)
    yield c, mock_db
    app.dependency_overrides.clear()


def test_list_careers_empty(client):
    cl, mock_db = client
    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
    response = cl.get("/api/v1/careers")
    assert response.status_code == 200
    assert response.json() == []


def test_list_careers_returns_data(client):
    cl, mock_db = client
    career = make_mock_career()
    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [career]
    response = cl.get("/api/v1/careers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Full-Stack Developer"


def test_get_career_not_found(client):
    cl, mock_db = client
    mock_db.query.return_value.options.return_value.filter.return_value.first.return_value = None
    response = cl.get("/api/v1/careers/999")
    assert response.status_code == 404


def test_list_skills_empty(client):
    cl, mock_db = client
    mock_db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = []
    response = cl.get("/api/v1/skills")
    assert response.status_code == 200
    assert response.json() == []


def test_list_categories_empty(client):
    cl, mock_db = client
    mock_db.query.return_value.order_by.return_value.all.return_value = []
    response = cl.get("/api/v1/skills/categories")
    assert response.status_code == 200
    assert response.json() == []
