"""main fastapi app for the banking project."""

from fastapi import FastAPI

from backend.app.controllers.auth_controller import router as auth_router
from backend.app.controllers.insights_controller import router as insights_router


app = FastAPI(title="Banking App API")

# add feature controllers to the main api app
app.include_router(auth_router)
app.include_router(insights_router)


@app.get("/health", tags=["Health"])
def health() -> dict:
    # quick way to check that the api is running
    return {"status": "ok"}
