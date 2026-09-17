"""Shared FastAPI dependencies.

Any route that needs to know who is making a request -- for ownership
checks, "is this your account", etc. -- should depend on get_current_user
rather than re-parsing the Authorization header and decoding the token
itself.
"""

from fastapi import Header, HTTPException, status

from backend.app.services.auth_service import AuthService


auth_service = AuthService()


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    """Resolve the signed-in user from the Authorization header.

    Raises 401 if the header is missing/malformed, the token is invalid or
    expired, or the token's user no longer exists.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )

    token = authorization[len("Bearer "):].strip()
    payload = auth_service.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    user = auth_service.users.find_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )

    return user
