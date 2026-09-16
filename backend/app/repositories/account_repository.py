"""MongoDB access for the accounts collection. All SQL/query code for
accounts lives here -- services never touch the collection directly.
"""
from backend.app.database import db, get_next_id


collection = db["accounts"]


class AccountRepository:

    def get_account_by_id(self, account_id: int) -> dict | None:
        account = collection.find_one({"account_id": account_id})
        return self._format_doc(account) if hasattr(self, "_format_doc") else account

    def get_accounts_for_user(self, user_id: int) -> list[dict]:
        cursor = collection.find({"user_id": user_id})
        return [self._format_doc(doc) for doc in cursor]

    def find_by_user_id(self, user_id: int) -> list[dict]:
        return list(collection.find({"user_id": user_id}, {"_id": 0}))

    def create_account(self, user_id: int, account_type: str, created_at: str, balance: float = 0.0) -> dict:
        account = {
            "account_id": get_next_id("account_id"),
            "user_id": user_id,
            "balance": balance,
            "account_type": account_type,
            "created_at": created_at,
        }
        collection.insert_one(account)
        account.pop("_id", None)
        return account

    def get_next_account_id(self) -> int:
        """Finds the maximum account_id and increments it by 1."""
        highest = collection.find_one(sort=[("account_id", -1)])
        return (highest["account_id"] + 1) if highest else 1