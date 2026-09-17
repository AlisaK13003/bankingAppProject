"""Tests for the get_current_user dependency. Run against mongomock (an
in-memory MongoDB fake) -- no real Atlas connection is used or touched.
"""

from datetime import datetime, timedelta, timezone

import jwt
import mongomock
import pytest
from fastapi import HTTPException

from backend.app import dependencies
from backend.app.repositories import account_repository, user_repository
from backend.app.services import auth_service as auth_service_module
from backend.app.services.auth_service import AuthService


@pytest.fixture
def service(monkeypatch):
    """An AuthService whose UserRepository/AccountRepository (via
    DashboardService) both point at a fresh mongomock database, and which
    dependencies.get_current_user is wired to use for this test.
    """
    client = mongomock.MongoClient()
    db = client["banking_app_test"]
    monkeypatch.setattr(user_repository, "collection", db["users"])
    monkeypatch.setattr(
        account_repository.AccountRepository,
        "collection",
        property(lambda self: db["accounts"]),
    )
    auth_service = AuthService()
    monkeypatch.setattr(dependencies, "auth_service", auth_service)
    return auth_service


def make_expired_token(user):
    expired = datetime.now(timezone.utc) - timedelta(minutes=1)
    payload = {"sub": str(user["user_id"]), "username": user["username"], "exp": expired}
    return jwt.encode(payload, auth_service_module.JWT_SECRET_KEY, algorithm=auth_service_module.JWT_ALGORITHM)


def test_missing_authorization_header_raises_401(service):
    with pytest.raises(HTTPException) as exc_info:
        dependencies.get_current_user(authorization=None)
    assert exc_info.value.status_code == 401


def test_authorization_header_without_bearer_prefix_raises_401(service):
    with pytest.raises(HTTPException) as exc_info:
        dependencies.get_current_user(authorization="just-a-token")
    assert exc_info.value.status_code == 401


def test_malformed_token_raises_401(service):
    with pytest.raises(HTTPException) as exc_info:
        dependencies.get_current_user(authorization="Bearer not-a-real-token")
    assert exc_info.value.status_code == 401


def test_expired_token_raises_401(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    token = make_expired_token(user)
    with pytest.raises(HTTPException) as exc_info:
        dependencies.get_current_user(authorization=f"Bearer {token}")
    assert exc_info.value.status_code == 401


def test_token_for_a_deleted_user_raises_401(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    token = service.create_access_token(user)
    user_repository.collection.delete_one({"user_id": user["user_id"]})

    with pytest.raises(HTTPException) as exc_info:
        dependencies.get_current_user(authorization=f"Bearer {token}")
    assert exc_info.value.status_code == 401


def test_valid_token_returns_the_matching_user(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    token = service.create_access_token(user)

    current_user = dependencies.get_current_user(authorization=f"Bearer {token}")

    assert current_user["user_id"] == user["user_id"]
    assert current_user["username"] == "alice"
    assert current_user["email"] == "alice@example.com"
