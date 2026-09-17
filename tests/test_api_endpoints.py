"""API smoke tests backed by mongomock.

These tests exercise FastAPI routes without touching the real Atlas database.
"""

import mongomock
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.repositories import (
    account_repository,
    transaction_repository,
    user_repository,
)


@pytest.fixture
def client(monkeypatch):
    mongo_client = mongomock.MongoClient()
    db = mongo_client["banking_app_api_test"]

    monkeypatch.setattr(user_repository, "collection", db["users"])
    monkeypatch.setattr(
        account_repository.AccountRepository,
        "collection",
        property(lambda self: db["accounts"]),
    )
    monkeypatch.setattr(
        transaction_repository.TransactionRepository,
        "collection",
        property(lambda self: db["transactions"]),
    )

    return TestClient(app)


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_auth_account_transaction_and_insights_flow(client):
    signup_response = client.post(
        "/signup",
        json={
            "username": "alice",
            "name": "Alice A",
            "email": "alice@example.com",
            "password": "GoodPass1!",
        },
    )
    assert signup_response.status_code == 201
    assert signup_response.json()["message"] == "Welcome, Alice A!"

    signin_response = client.post(
        "/signin",
        json={"username": "alice", "password": "GoodPass1!"},
    )
    assert signin_response.status_code == 200

    account_response = client.post(
        "/api/accounts",
        json={"userId": 1, "accountType": "CHECKING"},
    )
    assert account_response.status_code == 201
    account = account_response.json()
    assert account["account_id"] == 1
    assert account["balance"] == 0
    assert account["user"]["email"] == "alice@example.com"

    accounts_response = client.get("/api/users/1/accounts")
    assert accounts_response.status_code == 200
    assert accounts_response.json()["accounts"][0]["account_id"] == 1

    deposit_response = client.post(
        "/api/accounts/1/deposit",
        json={"amount": 500, "description": "Initial deposit"},
    )
    assert deposit_response.status_code == 200
    assert deposit_response.json()["account"]["balance"] == 500
    assert deposit_response.json()["transaction"]["txn_type"] == "DEPOSIT"

    withdraw_response = client.post(
        "/api/accounts/1/withdraw",
        json={
            "amount": 125,
            "category": "Food & Dining",
            "description": "Groceries",
        },
    )
    assert withdraw_response.status_code == 200
    assert withdraw_response.json()["account"]["balance"] == 375
    assert withdraw_response.json()["transaction"]["txn_type"] == "WITHDRAWAL"

    detail_response = client.get("/api/accounts/1")
    assert detail_response.status_code == 200
    assert detail_response.json()["balance"] == 375

    transactions_response = client.get("/api/accounts/1/transactions")
    assert transactions_response.status_code == 200
    transactions = transactions_response.json()["transactions"]
    assert len(transactions) == 2
    assert transactions[0]["txn_type"] == "WITHDRAWAL"
    assert transactions[1]["txn_type"] == "DEPOSIT"

    filtered_response = client.get(
        "/api/accounts/1/transactions",
        params={"type": "withdrawal", "category": "Food & Dining", "search": "grocer"},
    )
    assert filtered_response.status_code == 200
    assert filtered_response.json()["transaction_count"] == 1

    summary_response = client.get("/api/accounts/1/transactions/summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["deposits"] == 500
    assert summary["withdrawals"] == 125
    assert summary["net_change"] == 375

    categories_response = client.get("/api/accounts/1/transactions/categories")
    assert categories_response.status_code == 200
    assert "Food & Dining" in categories_response.json()

    insights_response = client.get("/api/accounts/1/insights")
    assert insights_response.status_code == 200
    insights = insights_response.json()
    assert insights["summary"]["total_deposits"] == 500
    assert insights["summary"]["total_withdrawals"] == 125
    assert insights["summary"]["net_change"] == 375
    assert insights["spending_by_category"][0]["category"] == "Food & Dining"
    assert insights["monthly_cash_flow"][-1]["deposits"] == 500
    assert insights["trends"]["top_spending_category"] == "Food & Dining"


def test_duplicate_signup_and_invalid_signin_return_expected_errors(client):
    payload = {
        "username": "alice",
        "name": "Alice A",
        "email": "alice@example.com",
        "password": "GoodPass1!",
    }
    assert client.post("/signup", json=payload).status_code == 201

    duplicate_response = client.post("/signup", json=payload)
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["detail"] == "That username is already taken."

    signin_response = client.post(
        "/signin",
        json={"username": "alice", "password": "WrongPass1!"},
    )
    assert signin_response.status_code == 401


def test_account_and_money_movement_errors(client):
    assert client.get("/api/accounts/404").status_code == 404

    missing_user_response = client.post(
        "/api/accounts",
        json={"userId": 404, "accountType": "SAVINGS"},
    )
    assert missing_user_response.status_code == 404

    client.post(
        "/signup",
        json={
            "username": "alice",
            "name": "Alice A",
            "email": "alice@example.com",
            "password": "GoodPass1!",
        },
    )
    client.post("/api/accounts", json={"userId": 1, "accountType": "SAVINGS"})

    overdraft_response = client.post(
        "/api/accounts/1/withdraw",
        json={"amount": 1, "category": "Other", "description": "Too much"},
    )
    assert overdraft_response.status_code == 400
    assert overdraft_response.json()["detail"] == "Cannot withdraw more than the account balance."

    validation_response = client.post(
        "/api/accounts/1/deposit",
        json={"amount": 0, "description": "Nope"},
    )
    assert validation_response.status_code == 422
