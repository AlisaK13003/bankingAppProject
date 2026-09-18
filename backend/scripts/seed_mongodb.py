"""Seed MongoDB Atlas with the current sample banking data."""

from pathlib import Path
import sys

from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient


ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_DIR))

from backend.app.data.sample_data import accounts, transactions, users  # noqa: E402
from backend.app.services.auth_service import hash_password  # noqa: E402


def build_seed_users() -> list[dict]:
    seeded_users = []
    for user in users:
        seeded_user = user.copy()
        seeded_user["password"] = hash_password(seeded_user["password"])
        seeded_users.append(seeded_user)
    return seeded_users


def main() -> None:
    load_dotenv(ROOT_DIR / ".env")

    import os

    mongodb_uri = os.getenv("MONGODB_URI")
    database_name = os.getenv("MONGODB_DB_NAME", "banking_app")

    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is missing. Add it to your local .env file.")

    client = MongoClient(mongodb_uri)
    client.admin.command("ping")

    db = client[database_name]

    users_collection = db["users"]
    accounts_collection = db["accounts"]
    transactions_collection = db["transactions"]

    users_collection.delete_many({})
    accounts_collection.delete_many({})
    transactions_collection.delete_many({})

    users_collection.create_index([("user_id", ASCENDING)], unique=True)
    users_collection.create_index([("email", ASCENDING)], unique=True)
    users_collection.create_index([("username", ASCENDING)], unique=True)

    accounts_collection.create_index([("account_id", ASCENDING)], unique=True)
    accounts_collection.create_index([("user_id", ASCENDING)])

    transactions_collection.create_index([("txn_id", ASCENDING)], unique=True)
    transactions_collection.create_index([("account_id", ASCENDING)])

    users_collection.insert_many(build_seed_users())
    accounts_collection.insert_many([account.copy() for account in accounts])
    transactions_collection.insert_many([transaction.copy() for transaction in transactions])

    print(f"Seeded database: {database_name}")
    print(f"Users: {users_collection.count_documents({})}")
    print(f"Accounts: {accounts_collection.count_documents({})}")
    print(f"Transactions: {transactions_collection.count_documents({})}")


if __name__ == "__main__":
    main()
