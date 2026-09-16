"""MongoDB access for the users collection. All SQL/query code for users
lives here -- services never touch the collection directly.
"""

from backend.app.database import db, get_next_id

collection = db["users"]


class UserRepository:

    def find_by_username(self, username: str) -> dict | None:
        return collection.find_one({"username": username}, {"_id": 0})

    def find_by_email(self, email: str) -> dict | None:
        return collection.find_one({"email": email}, {"_id": 0})

    def find_by_id(self, user_id: int) -> dict | None:
        return collection.find_one({"user_id": user_id}, {"_id": 0})

    def next_user_id(self) -> int:
        return get_next_id("user_id")

    def create_user(self, user_data: dict) -> dict:
        collection.insert_one(user_data)
        user_data.pop("_id", None)
        return user_data
