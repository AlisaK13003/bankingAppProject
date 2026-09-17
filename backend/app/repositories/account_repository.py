"""MongoDB access for the accounts collection."""

from pymongo import ASCENDING, DESCENDING

from backend.app.data.sample_data import accounts as sample_accounts
from backend.app.database import db


COLLECTION_NAME = "accounts"


class AccountRepository:

    def __init__(self, collection=None) -> None:
        self._collection = collection

    @property
    def collection(self):
        if self._collection is None:
            self._collection = db[COLLECTION_NAME]
        return self._collection

    def format_document(self, document: dict) -> dict:
        account = dict(document)
        account.pop("_id", None)
        return account

    def find_by_user_id(self, user_id: int) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id}).sort(
            [("account_id", ASCENDING)]
        )
        results = [self.format_document(document) for document in cursor]

        if results:
            return results

        return [
            dict(account)
            for account in sample_accounts
            if account["user_id"] == user_id
        ]

    def next_account_id(self) -> int:
        highest = self.collection.find_one(sort=[("account_id", DESCENDING)])

        if highest:
            return highest["account_id"] + 1

        if not sample_accounts:
            return 1

        return max(account["account_id"] for account in sample_accounts) + 1
