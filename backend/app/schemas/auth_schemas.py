"""request and response shapes for auth routes."""

from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str


class SignInRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    message: str
    dashboard: str
