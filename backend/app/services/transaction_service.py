"""business logic for transaction history."""

from datetime import date

from backend.app.repositories.transaction_repository import TransactionRepository
from backend.app.services.account_service import AccountService


class TransactionService:

    def __init__(self, transaction_repository: TransactionRepository | None = None) -> None:
        self.account_service = AccountService()
        self.transaction_repository = transaction_repository or TransactionRepository()

    # get transactions for an existing account, with optional table filters
    def get_transactions_for_account(
        self,
        account_id: int,
        txn_type: str | None = None,
        category: str | None = None,
        search: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> dict | None:
        account = self.account_service.get_account_by_id(account_id)

        if not account:
            return None

        account_transactions = []

        for transaction in self.transaction_repository.find_by_account_id(account_id):
            if self.matches_filters(
                transaction=transaction,
                txn_type=txn_type,
                category=category,
                search=search,
                date_from=date_from,
                date_to=date_to,
            ):
                account_transactions.append(self.format_transaction(transaction))

        account_transactions.sort(
            key=lambda transaction: (transaction["created_at"], transaction["txn_id"]),
            reverse=True,
        )

        return {
            "account_id": account_id,
            "transaction_count": len(account_transactions),
            "transactions": account_transactions,
        }

    # total deposits, withdrawals, and net change for the selected range
    def get_transaction_summary(
        self,
        account_id: int,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> dict | None:
        account = self.account_service.get_account_by_id(account_id)

        if not account:
            return None

        if date_from is None and date_to is None:
            today = date.today()
            date_from = today.replace(day=1)
            date_to = today

        account_transactions = []

        for transaction in self.transaction_repository.find_by_account_id(account_id):
            if self.matches_filters(
                transaction=transaction,
                date_from=date_from,
                date_to=date_to,
            ):
                account_transactions.append(transaction)

        deposit_count = 0
        withdrawal_count = 0
        deposits = 0
        withdrawals = 0

        for transaction in account_transactions:
            if transaction["txn_type"] == "DEPOSIT":
                deposit_count += 1
                deposits += transaction["amount"]
            elif transaction["txn_type"] == "WITHDRAWAL":
                withdrawal_count += 1
                withdrawals += transaction["amount"]

        deposits = round(deposits, 2)
        withdrawals = round(withdrawals, 2)

        return {
            "account_id": account_id,
            "transaction_count": len(account_transactions),
            "deposit_count": deposit_count,
            "withdrawal_count": withdrawal_count,
            "deposits": deposits,
            "withdrawals": withdrawals,
            "net_change": round(deposits - withdrawals, 2),
        }

    # check one transaction against the optional history filters
    def matches_filters(
        self,
        transaction: dict,
        txn_type: str | None = None,
        category: str | None = None,
        search: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> bool:
        if txn_type and transaction["txn_type"] != txn_type.upper():
            return False

        if category and transaction.get("category", "").lower() != category.lower():
            return False

        transaction_date = date.fromisoformat(transaction["created_at"])

        if date_from and transaction_date < date_from:
            return False

        if date_to and transaction_date > date_to:
            return False

        if search:
            search_text = search.lower()
            searchable_values = [
                transaction["txn_type"],
                transaction.get("description", ""),
                transaction.get("category", ""),
            ]

            if not any(search_text in value.lower() for value in searchable_values):
                return False

        return True

    # format a transaction for the history table
    def format_transaction(self, transaction: dict) -> dict:
        txn_type = transaction["txn_type"]
        amount = transaction["amount"]

        formatted_transaction = {
            "txn_id": transaction["txn_id"],
            "display_id": f"TXN-{transaction['txn_id']}",
            "account_id": transaction["account_id"],
            "txn_type": txn_type,
            "description": transaction.get("description", ""),
            "amount": amount,
            "created_at": transaction["created_at"],
            "date": transaction["created_at"],
        }

        if txn_type == "WITHDRAWAL":
            formatted_transaction["category"] = transaction["category"]

        return formatted_transaction
