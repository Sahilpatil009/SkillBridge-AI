from pydantic import BaseModel
from typing import Optional, Any


class HealthCheck(BaseModel):
    status: str
    version: str
    database: str


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None


class SuccessResponse(BaseModel):
    message: str
    data: Optional[Any] = None
