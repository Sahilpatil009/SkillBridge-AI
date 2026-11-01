from fastapi import APIRouter
from app.api.v1 import health, auth, profile, careers, skills, assessments, skill_gap, roadmap, resume

api_router = APIRouter()
api_router.include_router(health.router, prefix="")
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(careers.router)
api_router.include_router(skills.router)
api_router.include_router(assessments.router)
api_router.include_router(skill_gap.router)
api_router.include_router(roadmap.router)
api_router.include_router(resume.router)

