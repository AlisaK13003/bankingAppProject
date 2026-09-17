"""Tests for AuthService. Run against mongomock (an in-memory MongoDB
fake) -- no real Atlas connection is used or touched.
"""

import mongomock
import pytest

from backend.app.repositories import account_repository, user_repository
from backend.app.services.auth_service import AuthService


@pytest.fixture
def service(monkeypatch):
    """An AuthService whose UserRepository/AccountRepository (via
    DashboardService) both point at a fresh mongomock database.
    """
    client = mongomock.MongoClient()
    db = client["banking_app_test"]
    monkeypatch.setattr(user_repository, "collection", db["users"])
    monkeypatch.setattr(account_repository, "collection", db["accounts"])
    return AuthService()


# --------------------------------------------------------------- validate_password

def test_validate_password_accepts_a_valid_password(service):
    assert service.validate_password("GoodPass1!") is None


def test_validate_password_rejects_too_short(service):
    assert service.validate_password("Sh0rt!") is not None


def test_validate_password_rejects_missing_uppercase(service):
    assert service.validate_password("nouppercase1!") is not None


def test_validate_password_rejects_missing_special_character(service):
    assert service.validate_password("NoSpecial1") is not None


def test_validate_password_rejects_spaces(service):
    assert service.validate_password("Has Space1!") is not None


# ------------------------------------------------------------------ validate_email

def test_validate_email_accepts_a_valid_email(service):
    assert service.validate_email("alice@example.com") is None


def test_validate_email_rejects_missing_at_sign(service):
    assert service.validate_email("alice.example.com") is not None


def test_validate_email_rejects_multiple_at_signs(service):
    assert service.validate_email("ali@ce@example.com") is not None


def test_validate_email_rejects_missing_dot_in_domain(service):
    assert service.validate_email("alice@examplecom") is not None


def test_validate_email_rejects_spaces(service):
    assert service.validate_email("ali ce@example.com") is not None


# ---------------------------------------------------------- find_user / find_user_by_email

def test_find_user_existing_username_returns_the_user(service):
    service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    found = service.find_user("alice")
    assert found is not None
    assert found["username"] == "alice"


def test_find_user_missing_username_returns_none(service):
    assert service.find_user("nobody") is None


def test_find_user_by_email_existing_returns_the_user(service):
    service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    found = service.find_user_by_email("alice@example.com")
    assert found is not None
    assert found["email"] == "alice@example.com"


def test_find_user_by_email_missing_returns_none(service):
    assert service.find_user_by_email("nobody@example.com") is None


# ---------------------------------------------------------------------- create_user

def test_create_user_returns_expected_fields(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    assert user["username"] == "alice"
    assert user["name"] == "Alice A"
    assert user["email"] == "alice@example.com"
    assert user["password"] == "GoodPass1!"
    assert "created_at" in user


def test_create_user_assigns_sequential_ids(service):
    first = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    second = service.create_user("bob", "Bob B", "bob@example.com", "GoodPass1!")
    assert second["user_id"] == first["user_id"] + 1


def test_create_user_can_be_found_afterward(service):
    service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    assert service.find_user("alice") is not None
    assert service.find_user_by_email("alice@example.com") is not None


# ------------------------------------------------------------------- authenticate_user

def test_authenticate_user_with_correct_credentials(service):
    service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    user = service.authenticate_user("alice", "GoodPass1!")
    assert user is not None
    assert user["username"] == "alice"


def test_authenticate_user_with_wrong_password_returns_none(service):
    service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    assert service.authenticate_user("alice", "WrongPass1!") is None


def test_authenticate_user_with_unknown_username_returns_none(service):
    assert service.authenticate_user("nobody", "GoodPass1!") is None


# ------------------------------------------------------------------------ get_dashboard

def test_get_dashboard_greets_the_user_by_name(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    response = service.get_dashboard(user)
    assert response["message"] == "Welcome, Alice A!"


def test_get_dashboard_has_no_accounts_for_a_brand_new_user(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")
    response = service.get_dashboard(user)
    assert response["dashboard"]["accounts"] == []


def test_get_dashboard_lists_the_users_existing_accounts(service):
    user = service.create_user("alice", "Alice A", "alice@example.com", "GoodPass1!")

    account_repository.collection.insert_one({
        "account_id": 1,
        "user_id": user["user_id"],
        "balance": 250.0,
        "account_type": "CHECKING",
        "created_at": "2026-01-01",
    })

    response = service.get_dashboard(user)
    accounts = response["dashboard"]["accounts"]
    assert len(accounts) == 1
    assert accounts[0]["account_id"] == 1
    assert accounts[0]["balance"] == 250.0
