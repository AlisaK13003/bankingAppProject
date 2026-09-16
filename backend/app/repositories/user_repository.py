"""MongoDB access for the users collection. All SQL/query code for users
lives here -- services never touch the collection directly.
"""

from backend.app.database import db

collection = db["users"]


class UserRepository:

    def find_by_username(self, username: str) -> dict | None:
        return collection.find_one({"username": username}, {"_id": 0})

    def find_by_email(self, email: str) -> dict | None:
        return collection.find_one({"email": email}, {"_id": 0})

    def find_by_id(self, user_id: int) -> dict | None:
        return collection.find_one({"user_id": user_id}, {"_id": 0})

    # highest existing user_id + 1 -- no counters collection, so this reads
    # its own collection each time (see the race-condition note in the
    # AccountRepository/TransactionRepository equivalents)
    def next_user_id(self) -> int:
        highest = collection.find_one(sort=[("user_id", -1)])
        return (highest["user_id"] + 1) if highest else 1

    def create_user(self, user_data: dict) -> dict:
        collection.insert_one(user_data)
        user_data.pop("_id", None)
        return user_data
