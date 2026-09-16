"""MongoDB access for the accounts collection. All SQL/query code for
accounts lives here -- services never touch the collection directly.
"""

from backend.app.database import db, get_next_id

collection = db["accounts"]


class AccountRepository:

    def find_by_id(self, account_id: int) -> dict | None:
        return collection.find_one({"account_id": account_id}, {"_id": 0})

    def find_by_user_id(self, user_id: int) -> list[dict]:
        return list(collection.find({"user_id": user_id}, {"_id": 0}))

    def create(self, user_id: int, account_type: str, created_at: str, balance: float = 0.0) -> dict:
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

    def update_balance(self, account_id: int, new_balance: float) -> None:
        collection.update_one(
            {"account_id": account_id},
            {"$set": {"balance": round(new_balance, 2)}},
        )
