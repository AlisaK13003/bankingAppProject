"""mongodb access for the transactions collection."""

from pymongo import ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError

from backend.app.database import db


COLLECTION_NAME = "transactions"
MAX_ID_RETRIES = 5


class TransactionRepository:

    def __init__(self, collection=None) -> None:
        # tests inject a collection; the app resolves it on first use instead
        self._collection = collection

    @property
    def collection(self):
        if self._collection is None:
            self._collection = db[COLLECTION_NAME]
        return self._collection

    # return a plain dict shaped like a sample_data.py record
    def format_document(self, document: dict) -> dict:
        transaction = dict(document)
        transaction.pop("_id", None)
        return transaction

    # every transaction for one account, oldest first like the sample data
    def find_by_account_id(self, account_id: int) -> list[dict]:
        cursor = self.collection.find({"account_id": account_id}).sort(
            [("created_at", ASCENDING), ("txn_id", ASCENDING)]
        )

        return [self.format_document(document) for document in cursor]

    # the next txn_id, matching the max()+1 rule the sample data used
    def next_transaction_id(self) -> int:
        highest = self.collection.find_one(sort=[("txn_id", DESCENDING)])

        if not highest:
            return 1

        return highest["txn_id"] + 1

    # insert one transaction and return it without the mongo _id
    def create_transaction(self, transaction_data: dict) -> dict:
        transaction = dict(transaction_data)

        # the unique index on txn_id turns a concurrent insert into an error
        # instead of a silent overwrite, so take the next id and try again
        for attempt in range(MAX_ID_RETRIES):
            try:
                self.collection.insert_one(dict(transaction))
                return self.format_document(transaction)
            except DuplicateKeyError:
                if attempt == MAX_ID_RETRIES - 1:
                    raise
                transaction["txn_id"] = self.next_transaction_id()

        raise RuntimeError("Could not allocate a transaction id.")
