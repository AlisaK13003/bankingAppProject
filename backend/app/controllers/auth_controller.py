"""api routes for temporary auth."""

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.auth_schemas import AuthResponse, CreateAccountRequest, SignInRequest
from backend.app.services.auth_service import AuthService


router = APIRouter(tags=["Auth"])
auth_service = AuthService()


@router.post("/accounts", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def create_account(payload: CreateAccountRequest) -> dict:
    # create a temporary login account
    username = payload.username.strip()

    if auth_service.find_user(username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That username is already taken.",
        )

    error = auth_service.validate_password(payload.password)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    user = auth_service.create_user(username, payload.password)
    return auth_service.get_dashboard(user)


@router.post("/signin", response_model=AuthResponse)
def sign_in(payload: SignInRequest) -> dict:
    # check the temporary login account
    user = auth_service.authenticate_user(payload.username.strip(), payload.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    return auth_service.get_dashboard(user)
