"""request and response shapes for auth routes."""

from pydantic import BaseModel, Field

from backend.app.schemas.dashboard_schemas import DashboardResponse


class SignupRequest(BaseModel):
    username: str = Field(min_length=1)
    name: str = Field(min_length=1)
    email: str
    password: str


class SignInRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    dashboard: DashboardResponse
