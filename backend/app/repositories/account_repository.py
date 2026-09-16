"""MongoDB access for the accounts collection. All SQL/query code for
accounts lives here -- services never touch the collection directly.
"""

from backend.app.database import db

collection = db["accounts"]


class AccountRepository:

    def find_by_id(self, account_id: int) -> dict | None:
        return collection.find_one({"account_id": account_id}, {"_id": 0})

    def find_by_user_id(self, user_id: int) -> list[dict]:
        return list(collection.find({"user_id": user_id}, {"_id": 0}))

    # highest existing account_id + 1 -- no counters collection, so two
    # requests creating accounts at the exact same time could read the same
    # max and collide. The old in-memory sample_data code had this same
    # race condition; this just moves it into MongoDB.
    def next_account_id(self) -> int:
        highest = collection.find_one(sort=[("account_id", -1)])
        return (highest["account_id"] + 1) if highest else 1

    def create(self, user_id: int, account_type: str, created_at: str, balance: float = 0.0) -> dict:
        account = {
            "account_id": self.next_account_id(),
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
