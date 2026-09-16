"""MongoDB access for the transactions collection. All SQL/query code for
transactions lives here -- services never touch the collection directly.
"""

from backend.app.database import db

collection = db["transactions"]


class TransactionRepository:

    def find_by_account(self, account_id: int) -> list[dict]:
        return list(
            collection.find({"account_id": account_id}, {"_id": 0}).sort("created_at", -1)
        )

    # highest existing txn_id + 1 -- same race-condition tradeoff noted in
    # AccountRepository.next_account_id()
    def next_txn_id(self) -> int:
        highest = collection.find_one(sort=[("txn_id", -1)])
        return (highest["txn_id"] + 1) if highest else 1

    def create(
        self,
        account_id: int,
        txn_type: str,
        amount: float,
        description: str,
        created_at: str,
        category: str | None = None,
    ) -> dict:
        transaction = {
            "txn_id": self.next_txn_id(),
            "account_id": account_id,
            "txn_type": txn_type,
            "amount": round(amount, 2),
            "description": description,
            "created_at": created_at,
        }
        if category is not None:
            transaction["category"] = category

        collection.insert_one(transaction)
        transaction.pop("_id", None)
        return transaction
