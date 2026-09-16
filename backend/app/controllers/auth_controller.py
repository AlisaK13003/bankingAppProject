"""api routes for temporary auth."""

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.auth_schemas import AuthResponse, SignupRequest, SignInRequest
from backend.app.services.auth_service import AuthService


router = APIRouter(tags=["Auth"])
auth_service = AuthService()


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest) -> dict:
    # create a temporary login account
    username = payload.username.strip()
    name = payload.name.strip()
    email = payload.email.strip()

    if auth_service.find_user(username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That username is already taken.",
        )

    error = auth_service.validate_email(email)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    if auth_service.find_user_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    error = auth_service.validate_password(payload.password)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    user = auth_service.create_user(username, name, email, payload.password)
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
