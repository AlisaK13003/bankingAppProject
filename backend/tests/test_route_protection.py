"""tests for route protection and ownership checks (Person 3).

Runs against mongomock, so no Atlas cluster or network is needed.

Most of these are negative cases on purpose. The point of this layer is not
that the right person gets in - it is that the wrong person does not.

Status codes follow the team's split document:
    401  no token, expired token, invalid token
    403  a real signed-in user reaching data that is not theirs
    404  the account genuinely does not exist
"""

import os
from datetime import datetime, timedelta, timezone

import jwt
import mongomock
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("JWT_SECRET_KEY", "test-only-key-not-for-real-use")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")

# Point every repository at an in-memory database.
#
# Rebinding backend.app.database.db is NOT enough: the repository modules do
# "from backend.app.database import db", which binds the object at their own
# import time, so a later rebind never reaches them. That made this file pass
# alone and fail when another test module imported the repositories first.
# Patching the class attribute works whatever the import order, because it is
# read on each call.
import backend.app.repositories.account_repository as account_repository  # noqa: E402
import backend.app.repositories.transaction_repository as transaction_repository  # noqa: E402
import backend.app.repositories.user_repository as user_repository  # noqa: E402

_fake = mongomock.MongoClient()["banking_app_test"]

account_repository.AccountRepository.collection = property(lambda self: _fake["accounts"])
transaction_repository.TransactionRepository.collection = property(
    lambda self: _fake["transactions"]
)
user_repository.collection = _fake["users"]

from backend.app.data.sample_data import accounts as sample_accounts  # noqa: E402
from backend.app.data.sample_data import transactions as sample_transactions  # noqa: E402
from backend.app.data.sample_data import users as sample_users  # noqa: E402
from backend.app.main import app  # noqa: E402
from backend.app.services.auth_service import (  # noqa: E402
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    AuthService,
)


# sample data ownership, for reference in the assertions below:
#   user 1 -> accounts 1 and 2
#   user 2 -> account 3
#   user 4 -> account 4
JORDAN = 1
ALEX = 2
JORDANS_ACCOUNT = 1
ALEXS_ACCOUNT = 3
MISSING_ACCOUNT = 9999


@pytest.fixture(autouse=True)
def seeded_database():
    for name in ("users", "accounts", "transactions"):
        _fake[name].delete_many({})

    _fake["users"].insert_many([dict(user) for user in sample_users])
    _fake["accounts"].insert_many([dict(account) for account in sample_accounts])
    _fake["transactions"].insert_many([dict(txn) for txn in sample_transactions])
    yield


@pytest.fixture
def client():
    return TestClient(app)


_auth = AuthService()


def token_for(user_id: int) -> str:
    # mint the token from the real seeded user, the same way signin does.
    # main's get_current_user looks the user up again on every request, so a
    # made-up user would be rejected with a 401 rather than reaching the
    # ownership checks these tests are about.
    user = _fake["users"].find_one({"user_id": user_id}, {"_id": 0})
    return _auth.create_access_token(user)


def headers_for(user_id: int) -> dict:
    return {"Authorization": f"Bearer {token_for(user_id)}"}


# every route this person owns, with a body where one is needed
PROTECTED_ROUTES = [
    ("get", "/api/accounts/1", None),
    ("get", "/api/users/1/accounts", None),
    ("get", "/api/accounts/1/transactions", None),
    ("get", "/api/accounts/1/transactions/summary", None),
    ("get", "/api/accounts/1/transactions/categories", None),
    ("get", "/api/accounts/1/insights", None),
    ("post", "/api/accounts/1/deposit", {"amount": 10}),
    ("post", "/api/accounts/1/withdraw", {"amount": 10, "category": "Bills"}),
    ("post", "/api/accounts", {"userId": 1, "accountType": "SAVINGS"}),
    ("post", "/logout", None),
]


def call(client, method, path, body, headers=None):
    if method == "post":
        return client.post(path, json=body, headers=headers)
    return client.get(path, headers=headers)


# ------------------------------------------------- 401: login required
@pytest.mark.parametrize("method,path,body", PROTECTED_ROUTES)
def test_every_route_requires_login(client, method, path, body):
    assert call(client, method, path, body).status_code == 401


@pytest.mark.parametrize("method,path,body", PROTECTED_ROUTES)
def test_a_garbage_token_is_refused(client, method, path, body):
    response = call(client, method, path, body, {"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401


def test_an_expired_token_is_refused(client):
    expired = jwt.encode(
        {"sub": str(JORDAN), "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

    response = client.get("/api/accounts/1", headers={"Authorization": f"Bearer {expired}"})

    assert response.status_code == 401


def test_a_token_signed_with_another_key_is_refused(client):
    forged = jwt.encode(
        {"sub": str(JORDAN), "exp": datetime.now(timezone.utc) + timedelta(minutes=10)},
        "attacker-key",
        algorithm=JWT_ALGORITHM,
    )

    response = client.get("/api/accounts/1", headers={"Authorization": f"Bearer {forged}"})

    assert response.status_code == 401


def test_an_unsigned_none_algorithm_token_is_refused(client):
    # the classic JWT attack: claim there is no signature to check
    forged = jwt.encode({"sub": str(JORDAN)}, key="", algorithm="none")

    response = client.get("/api/accounts/1", headers={"Authorization": f"Bearer {forged}"})

    assert response.status_code == 401


# ------------------------------------------- 200: the owner gets through
def test_the_owner_can_read_their_account(client):
    response = client.get(f"/api/accounts/{JORDANS_ACCOUNT}", headers=headers_for(JORDAN))

    assert response.status_code == 200
    assert response.json()["account_id"] == JORDANS_ACCOUNT


def test_the_owner_can_list_their_own_accounts(client):
    response = client.get(f"/api/users/{JORDAN}/accounts", headers=headers_for(JORDAN))

    assert response.status_code == 200
    assert {item["account_id"] for item in response.json()["accounts"]} == {1, 2}


def test_the_owner_can_read_their_transaction_history(client):
    response = client.get(
        f"/api/accounts/{JORDANS_ACCOUNT}/transactions", headers=headers_for(JORDAN)
    )

    assert response.status_code == 200
    assert response.json()["transaction_count"] > 0


def test_the_owner_can_deposit_and_withdraw(client):
    deposit = client.post(
        f"/api/accounts/{JORDANS_ACCOUNT}/deposit",
        json={"amount": 100, "description": "Cash Deposit"},
        headers=headers_for(JORDAN),
    )
    withdraw = client.post(
        f"/api/accounts/{JORDANS_ACCOUNT}/withdraw",
        json={"amount": 25, "category": "Shopping"},
        headers=headers_for(JORDAN),
    )

    assert deposit.status_code == 200
    assert withdraw.status_code == 200


def test_money_movements_appear_in_transaction_history(client):
    deposit = client.post(
        f"/api/accounts/{JORDANS_ACCOUNT}/deposit",
        json={"amount": 100, "description": "Demo deposit"},
        headers=headers_for(JORDAN),
    )
    withdraw = client.post(
        f"/api/accounts/{JORDANS_ACCOUNT}/withdraw",
        json={"amount": 25, "category": "Shopping", "description": "Demo withdrawal"},
        headers=headers_for(JORDAN),
    )
    history = client.get(
        f"/api/accounts/{JORDANS_ACCOUNT}/transactions", headers=headers_for(JORDAN)
    )

    assert deposit.status_code == 200
    assert withdraw.status_code == 200
    assert history.status_code == 200

    transactions = history.json()["transactions"]
    assert transactions[0]["txn_type"] == "WITHDRAWAL"
    assert transactions[0]["description"] == "Demo withdrawal"
    assert transactions[0]["category"] == "Shopping"
    assert transactions[1]["txn_type"] == "DEPOSIT"
    assert transactions[1]["description"] == "Demo deposit"
    assert any(
        transaction["txn_type"] == "DEPOSIT"
        and transaction["description"] == "Demo deposit"
        for transaction in transactions
    )
    assert any(
        transaction["txn_type"] == "WITHDRAWAL"
        and transaction["description"] == "Demo withdrawal"
        and transaction["category"] == "Shopping"
        for transaction in transactions
    )


# ------------------------------- 403: signed in, but not your bank data
def test_a_user_cannot_read_someone_elses_account(client):
    response = client.get(f"/api/accounts/{ALEXS_ACCOUNT}", headers=headers_for(JORDAN))

    assert response.status_code == 403


def test_a_user_cannot_list_someone_elses_accounts(client):
    response = client.get(f"/api/users/{ALEX}/accounts", headers=headers_for(JORDAN))

    assert response.status_code == 403


def test_a_user_cannot_read_someone_elses_transaction_history(client):
    response = client.get(
        f"/api/accounts/{ALEXS_ACCOUNT}/transactions", headers=headers_for(JORDAN)
    )

    assert response.status_code == 403


def test_a_user_cannot_read_someone_elses_summary_or_categories(client):
    summary = client.get(
        f"/api/accounts/{ALEXS_ACCOUNT}/transactions/summary", headers=headers_for(JORDAN)
    )
    categories = client.get(
        f"/api/accounts/{ALEXS_ACCOUNT}/transactions/categories", headers=headers_for(JORDAN)
    )

    assert summary.status_code == 403
    assert categories.status_code == 403


def test_a_user_cannot_read_someone_elses_insights(client):
    response = client.get(f"/api/accounts/{ALEXS_ACCOUNT}/insights", headers=headers_for(JORDAN))

    assert response.status_code == 403


def test_a_user_cannot_deposit_into_someone_elses_account(client):
    before = _fake["accounts"].find_one({"account_id": ALEXS_ACCOUNT})["balance"]

    response = client.post(
        f"/api/accounts/{ALEXS_ACCOUNT}/deposit",
        json={"amount": 500},
        headers=headers_for(JORDAN),
    )

    assert response.status_code == 403
    assert _fake["accounts"].find_one({"account_id": ALEXS_ACCOUNT})["balance"] == before


def test_a_user_cannot_withdraw_from_someone_elses_account(client):
    before = _fake["accounts"].find_one({"account_id": ALEXS_ACCOUNT})["balance"]

    response = client.post(
        f"/api/accounts/{ALEXS_ACCOUNT}/withdraw",
        json={"amount": 100, "category": "Bills"},
        headers=headers_for(JORDAN),
    )

    # refused, and the balance is untouched - the guard runs before the
    # service, so nothing partial happens
    assert response.status_code == 403
    assert _fake["accounts"].find_one({"account_id": ALEXS_ACCOUNT})["balance"] == before


def test_a_user_cannot_open_an_account_for_someone_else(client):
    response = client.post(
        "/api/accounts",
        json={"userId": ALEX, "accountType": "CHECKING"},
        headers=headers_for(JORDAN),
    )

    assert response.status_code == 403


def test_a_user_can_open_their_own_account(client):
    response = client.post(
        "/api/accounts",
        json={"userId": JORDAN, "accountType": "SAVINGS"},
        headers=headers_for(JORDAN),
    )

    assert response.status_code == 201


# ------------------------------------- 404: the account does not exist
def test_a_missing_account_is_a_404_not_a_403(client):
    response = client.get(f"/api/accounts/{MISSING_ACCOUNT}", headers=headers_for(JORDAN))

    assert response.status_code == 404


# ------------------------------------------------------- token contents
def test_the_token_carries_the_agreed_claims():
    claims = jwt.decode(token_for(JORDAN), JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

    assert claims["sub"] == str(JORDAN)
    assert claims["role"] == "user"
    assert "exp" in claims
