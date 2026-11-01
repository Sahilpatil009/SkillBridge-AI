import pytest
import datetime
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.db.base import get_db
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def make_mock_user(user_id=1, email="test@example.com", name="Test User", password="password123"):
    user = MagicMock(spec=User)
    user.id = user_id
    user.name = name
    user.email = email
    user.hashed_password = get_password_hash(password)
    user.role = UserRole.student
    user.is_active = True
    user.created_at = datetime.datetime(2026, 1, 1)
    user.profile = None
    return user


@pytest.fixture
def client_with_mock_db():
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app)
    yield client, mock_db
    app.dependency_overrides.clear()


def test_register_new_user(client_with_mock_db):
    client, mock_db = client_with_mock_db
    mock_db.query.return_value.filter.return_value.first.return_value = None
    mock_db.flush = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()
    payload = {"name": "Alice", "email": "alice@example.com", "password": "securepass123"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client_with_mock_db):
    client, mock_db = client_with_mock_db
    existing = make_mock_user()
    mock_db.query.return_value.filter.return_value.first.return_value = existing
    payload = {"name": "Bob", "email": "test@example.com", "password": "securepass123"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_short_password(client_with_mock_db):
    client, mock_db = client_with_mock_db
    payload = {"name": "Bob", "email": "bob@example.com", "password": "short"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_valid_credentials(client_with_mock_db):
    client, mock_db = client_with_mock_db
    user = make_mock_user()
    mock_db.query.return_value.filter.return_value.first.return_value = user
    payload = {"email": "test@example.com", "password": "password123"}
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client_with_mock_db):
    client, mock_db = client_with_mock_db
    user = make_mock_user()
    mock_db.query.return_value.filter.return_value.first.return_value = user
    payload = {"email": "test@example.com", "password": "wrongpassword"}
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_login_unknown_email(client_with_mock_db):
    client, mock_db = client_with_mock_db
    mock_db.query.return_value.filter.return_value.first.return_value = None
    payload = {"email": "nobody@example.com", "password": "password123"}
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_me_without_token(client_with_mock_db):
    client, mock_db = client_with_mock_db
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_with_valid_token(client_with_mock_db):
    client, mock_db = client_with_mock_db
    from app.core.security import create_access_token
    user = make_mock_user()
    profile_mock = MagicMock()
    profile_mock.id = 1
    profile_mock.user_id = 1
    profile_mock.college = None
    profile_mock.degree = None
    profile_mock.branch = None
    profile_mock.year_of_study = None
    profile_mock.career_interests = None
    profile_mock.learning_format = None
    profile_mock.study_hours_per_week = None
    profile_mock.career_goal = None
    profile_mock.bio = None
    profile_mock.github_url = None
    profile_mock.linkedin_url = None
    profile_mock.created_at = datetime.datetime(2026, 1, 1)
    profile_mock.updated_at = datetime.datetime(2026, 1, 1)
    user.profile = profile_mock
    mock_db.query.return_value.filter.return_value.first.return_value = user
    token = create_access_token({"sub": "1"})
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_password_not_stored_plaintext():
    from app.core.security import get_password_hash, verify_password
    pw = "mysecretpassword"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert "$" in hashed
    assert verify_password(pw, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_logout(client_with_mock_db):
    client, mock_db = client_with_mock_db
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
