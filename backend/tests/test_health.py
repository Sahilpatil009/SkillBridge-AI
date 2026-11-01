import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch


def test_root_endpoint():
    with patch("app.db.base.engine"):
        from app.main import app
        client = TestClient(app)
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


def test_health_endpoint_db_connected():
    """Test health check with a mocked DB connection."""
    from app.main import app
    from app.db.base import get_db
    
    mock_db = MagicMock()
    mock_db.execute.return_value = None
    
    def override_get_db():
        yield mock_db
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    app.dependency_overrides.clear()
