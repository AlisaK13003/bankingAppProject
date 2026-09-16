"""MongoDB connection, shared by the repository layer.

Connection string comes from the MONGODB_URI env var, loaded from a local
.env file (see the team's shared contract -- MONGODB_URI, MONGODB_DB_NAME).
One client is created here and reused everywhere via `db`.
"""

import os

from dotenv import load_dotenv
from pymongo import MongoClient, ReturnDocument

load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "banking_app")

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]


def get_next_id(sequence_name: str) -> int:
    """Atomically get the next integer id for a collection.

    MongoDB has no built-in auto-increment, so this keeps one counter
    document per id sequence (e.g. "user_id", "account_id") and increments
    it with $inc, which is atomic even under concurrent requests -- unlike
    the old `max(existing_ids) + 1` approach.
    """
    counters = db["counters"]
    result = counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return result["value"]
