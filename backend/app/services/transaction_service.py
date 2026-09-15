"""business logic for transaction history."""

from backend.app.data.sample_data import transactions
from backend.app.services.account_service import AccountService


class TransactionService:

    def __init__(self) -> None:
        self.account_service = AccountService()

    # get all transactions for an existing account
    def get_transactions_for_account(self, account_id: int) -> dict | None:
        account = self.account_service.get_account_by_id(account_id)

        if not account:
            return None

        account_transactions = []

        for transaction in transactions:
            if transaction["account_id"] == account_id:
                account_transactions.append(transaction)

        account_transactions.sort(
            key=lambda transaction: transaction["created_at"],
            reverse=True,
        )

        return {
            "account_id": account_id,
            "transaction_count": len(account_transactions),
            "transactions": account_transactions,
        }
