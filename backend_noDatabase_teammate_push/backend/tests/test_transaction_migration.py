"""tests for TransactionRepository and the transaction side of the services.

These run against mongomock, an in-memory stand-in for MongoDB, so they pass
without an Atlas cluster, a connection string, or a network connection. The
repository takes an injected collection for exactly this reason.

Scope note: account balances still live in sample_data until the account
details track lands AccountRepository.update_balance, so the balance
assertions below read the sample data on purpose.
"""

from datetime import date

import mongomock
import pytest

from backend.app.data.sample_data import accounts as sample_accounts
from backend.app.data.sample_data import transactions as sample_transactions
from backend.app.repositories.transaction_repository import TransactionRepository
from backend.app.services.account_service import (
    AccountService,
    InsufficientFundsError,
    InvalidAmountError,
)
from backend.app.services.transaction_service import TransactionService


@pytest.fixture(autouse=True)
def restore_sample_balances():
    # deposit/withdraw still mutate the sample_data list, so put the starting
    # balances back after each test instead of letting them leak
    original = {account["account_id"]: account["balance"] for account in sample_accounts}
    yield
    for account in sample_accounts:
        account["balance"] = original[account["account_id"]]


@pytest.fixture
def collection():
    # a fresh in-memory transactions collection seeded with the sample data,
    # so the tests measure the migration and not a difference in fixtures
    database = mongomock.MongoClient()["banking_app"]
    database["transactions"].insert_many([dict(txn) for txn in sample_transactions])
    database["transactions"].create_index("txn_id", unique=True)
    return database["transactions"]


@pytest.fixture
def transaction_repository(collection):
    return TransactionRepository(collection=collection)


@pytest.fixture
def account_service(transaction_repository):
    return AccountService(transaction_repository=transaction_repository)


@pytest.fixture
def transaction_service(transaction_repository):
    return TransactionService(transaction_repository=transaction_repository)


# --------------------------------------------------------------- repository
def test_find_by_account_id_returns_only_that_account(transaction_repository):
    found = transaction_repository.find_by_account_id(2)

    assert len(found) == 6
    assert {txn["account_id"] for txn in found} == {2}


def test_find_by_account_id_hides_the_mongo_id(transaction_repository):
    for transaction in transaction_repository.find_by_account_id(1):
        assert "_id" not in transaction


def test_find_by_account_id_is_empty_for_an_account_with_no_activity(transaction_repository):
    assert transaction_repository.find_by_account_id(3) == []


def test_find_by_account_id_returns_sample_data_shaped_dicts(transaction_repository):
    withdrawal = next(
        txn for txn in transaction_repository.find_by_account_id(1)
        if txn["txn_type"] == "WITHDRAWAL"
    )
    deposit = next(
        txn for txn in transaction_repository.find_by_account_id(1)
        if txn["txn_type"] == "DEPOSIT"
    )

    assert set(withdrawal) == {
        "txn_id", "account_id", "txn_type", "amount", "category",
        "description", "created_at",
    }
    # deposits carry no category - the asymmetry the response schemas model
    assert "category" not in deposit


def test_next_transaction_id_follows_the_highest_existing_id(transaction_repository):
    assert transaction_repository.next_transaction_id() == 42


def test_next_transaction_id_starts_at_one_when_empty():
    empty = mongomock.MongoClient()["banking_app"]["transactions"]

    assert TransactionRepository(collection=empty).next_transaction_id() == 1


def test_create_transaction_stores_and_returns_the_row(transaction_repository):
    created = transaction_repository.create_transaction(
        {"txn_id": 42, "account_id": 1, "txn_type": "DEPOSIT",
         "amount": 5.00, "description": "Cash Deposit", "created_at": "2026-09-16"}
    )

    assert "_id" not in created
    assert transaction_repository.collection.count_documents({"txn_id": 42}) == 1


def test_create_transaction_retries_when_the_id_is_taken(transaction_repository):
    # simulate a concurrent insert grabbing 42 first
    transaction_repository.collection.insert_one(
        {"txn_id": 42, "account_id": 1, "txn_type": "DEPOSIT",
         "amount": 1.00, "description": "Race", "created_at": "2026-09-16"}
    )

    created = transaction_repository.create_transaction(
        {"txn_id": 42, "account_id": 1, "txn_type": "DEPOSIT",
         "amount": 5.00, "description": "Retry me", "created_at": "2026-09-16"}
    )

    assert created["txn_id"] == 43
    assert created["description"] == "Retry me"


# ------------------------------------------------- money movement -> mongo
def test_deposit_writes_the_transaction_to_mongo(account_service, transaction_repository):
    result = account_service.deposit(account_id=1, amount=100.00, description="Cash Deposit")
    transaction = result["transaction"]

    assert transaction["txn_id"] == 42
    assert transaction["txn_type"] == "DEPOSIT"
    assert transaction["amount"] == 100.00
    assert transaction["created_at"] == date.today().isoformat()
    assert "category" not in transaction

    stored = transaction_repository.collection.find_one({"txn_id": 42})
    assert stored["description"] == "Cash Deposit"


def test_withdraw_writes_the_transaction_with_its_category(account_service, transaction_repository):
    result = account_service.withdraw(
        account_id=1, amount=84.20, category="Shopping", description="Book Store"
    )

    assert result["transaction"]["category"] == "Shopping"
    assert transaction_repository.collection.find_one({"txn_id": 42})["category"] == "Shopping"


def test_deposit_rejects_a_non_positive_amount(account_service, transaction_repository):
    with pytest.raises(InvalidAmountError):
        account_service.deposit(account_id=1, amount=0)

    # nothing was written
    assert transaction_repository.next_transaction_id() == 42


def test_withdraw_more_than_the_balance_writes_nothing(account_service, transaction_repository):
    with pytest.raises(InsufficientFundsError):
        account_service.withdraw(account_id=4, amount=500.00, category="Bills")

    assert transaction_repository.next_transaction_id() == 42


def test_money_movement_on_a_missing_account_returns_none(account_service):
    assert account_service.deposit(account_id=999, amount=10.00) is None
    assert account_service.withdraw(account_id=999, amount=10.00, category="Bills") is None


# ------------------------------------------------------------------ history
def test_history_reads_from_mongo_newest_first(transaction_service):
    history = transaction_service.get_transactions_for_account(1)

    assert history["transaction_count"] == 27
    assert history["transactions"][0]["txn_id"] == 27
    assert history["transactions"][0]["display_id"] == "TXN-27"


def test_history_filters_still_work_against_mongo(transaction_service):
    history = transaction_service.get_transactions_for_account(
        account_id=1,
        txn_type="withdrawal",
        category="Food & Dining",
        date_from=date(2026, 9, 1),
        date_to=date(2026, 9, 30),
    )

    assert history["transaction_count"] == 2
    assert [txn["txn_id"] for txn in history["transactions"]] == [27, 22]


def test_history_search_covers_description_and_category(transaction_service):
    history = transaction_service.get_transactions_for_account(account_id=1, search="ride")

    assert [txn["txn_id"] for txn in history["transactions"]] == [24, 19]


def test_history_for_an_account_with_no_activity_is_empty_not_missing(transaction_service):
    history = transaction_service.get_transactions_for_account(3)

    assert history["transaction_count"] == 0
    assert history["transactions"] == []


def test_history_for_a_missing_account_is_none(transaction_service):
    assert transaction_service.get_transactions_for_account(999) is None


def test_summary_totals_come_from_mongo(transaction_service):
    summary = transaction_service.get_transaction_summary(
        account_id=1, date_from=date(2026, 9, 1), date_to=date(2026, 9, 30)
    )

    assert summary["deposit_count"] == 2
    assert summary["withdrawal_count"] == 5
    assert summary["deposits"] == 2800.00
    assert summary["withdrawals"] == 182.77
    assert summary["net_change"] == 2617.23


def test_a_deposit_shows_up_in_the_history_immediately(account_service, transaction_service):
    account_service.deposit(account_id=1, amount=25.00, description="Freelance Payment")

    history = transaction_service.get_transactions_for_account(account_id=1, search="freelance")

    assert history["transaction_count"] == 2
    assert history["transactions"][0]["txn_id"] == 42
