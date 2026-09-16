"""api routes for the dashboard."""

from fastapi import APIRouter

router = APIRouter(tags=["Dashboard"])


@router.post("/logout")
def logout() -> dict:
    # stateless for now -- there is no server-side session to invalidate
    return {"message": "Signed out."}
