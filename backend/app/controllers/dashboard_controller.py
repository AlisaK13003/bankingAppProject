"""api routes for the dashboard."""

from fastapi import APIRouter, Depends

from backend.app.dependencies import get_current_user

router = APIRouter(tags=["Dashboard"])


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)) -> dict:
    # stateless for now -- there is no server-side session to invalidate
    return {"message": "Signed out."}
