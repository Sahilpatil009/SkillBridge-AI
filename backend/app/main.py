import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.router import api_router


def _cors_origins() -> list[str]:
    origins = {
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
    }
    vercel_url = os.getenv("VERCEL_URL")
    if vercel_url:
        origins.add(f"https://{vercel_url.removeprefix('https://')}")
    production_url = os.getenv("VERCEL_PROJECT_PRODUCTION_URL")
    if production_url:
        origins.add(
            production_url if production_url.startswith("http") else f"https://{production_url}"
        )
    return [origin for origin in origins if origin]


def _init_schema_and_seed() -> None:
    from app.db.base import Base, SessionLocal, engine
    import app.models  # noqa: F401
    from app.models.career import Career, CareerSkillRequirement
    from app.models.assessment import Question

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        needs_catalog = db.query(Career).first() is None
        needs_requirements = db.query(CareerSkillRequirement).first() is None
        needs_questions = db.query(Question).first() is None
        if needs_catalog or needs_requirements:
            from app.db.seed import seed

            seed()
        if needs_questions:
            from app.db.seed_questions import seed as seed_questions
            from app.db.seed_questions_extended import seed as seed_questions_extended

            seed_questions()
            seed_questions_extended()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if os.getenv("VERCEL") or os.getenv("RENDER"):
        _init_schema_and_seed()
    yield


app = FastAPI(
    title="SkillBridge AI",
    description="AI-Powered Career Guidance and Skill Gap Analysis Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "code": "INTERNAL_ERROR"},
    )


app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root():
    return {"message": "SkillBridge AI API is running. Visit /docs for API documentation."}
