import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


def _default_database_url() -> str:
    if os.getenv("VERCEL"):
        return "sqlite:////tmp/skillbridge.db"
    return "sqlite:///./skillbridge.db"


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg2://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url[len("postgresql://") :]
    return url


class Settings:
    DATABASE_URL: str = _normalize_database_url(
        os.getenv("DATABASE_URL", _default_database_url())
    )
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "10080" if os.getenv("VERCEL") else "30",
        )
    )
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "gpt-4o-mini")

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
