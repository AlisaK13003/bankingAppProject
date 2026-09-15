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
                account_transactions.append(self.format_transaction(transaction))

        account_transactions.sort(
            key=lambda transaction: transaction["created_at"],
            reverse=True,
        )

        return {
            "account_id": account_id,
            "transaction_count": len(account_transactions),
            "transactions": account_transactions,
        }

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
