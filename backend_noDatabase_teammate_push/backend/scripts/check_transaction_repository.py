"""manual smoke check for TransactionRepository against the real cluster.

Read only by default - it prints what each repository method returns from
MongoDB so you can see the live data, without changing anything.

    python -m backend.scripts.check_transaction_repository

Add --write to also prove create_transaction round trips. That inserts one
transaction and deletes it again, so the shared database is left as it was.

    python -m backend.scripts.check_transaction_repository --write

Needs a .env in the repo root with MONGODB_URI and MONGODB_DB_NAME.
"""

import sys
from datetime import date

from backend.app.db import get_database
from backend.app.repositories.transaction_repository import TransactionRepository


ACCOUNT_ID = 1


def show(label: str, value) -> None:
    print(f"  {label:<34} {value}")


def main() -> int:
    write = "--write" in sys.argv

    database = get_database()
    database.client.admin.command("ping")
    print(f"\nconnected to {database.name}\n")

    repository = TransactionRepository(collection=database["transactions"])

    print("find_by_account_id")
    rows = repository.find_by_account_id(ACCOUNT_ID)
    show(f"transactions for account {ACCOUNT_ID}", len(rows))

    if not rows:
        print("\n  No transactions found. Has the seed script run yet?\n")
        return 1

    show("oldest", f"{rows[0]['created_at']}  {rows[0]['description']}")
    show("newest", f"{rows[-1]['created_at']}  {rows[-1]['description']}")
    show("mongo _id hidden", "_id" not in rows[0])
    show("deposits have no category", not any(
        "category" in row for row in rows if row["txn_type"] == "DEPOSIT"
    ))

    print("\nfind_by_account_id on an account with no rows")
    show("returns", repository.find_by_account_id(99999))

    print("\nnext_transaction_id")
    next_id = repository.next_transaction_id()
    show("next id", next_id)
    show("higher than every stored id", next_id > max(row["txn_id"] for row in rows))

    if not write:
        print("\ncreate_transaction  (skipped - pass --write to test it)\n")
        return 0

    print("\ncreate_transaction")
    created = repository.create_transaction({
        "txn_id": next_id,
        "account_id": ACCOUNT_ID,
        "txn_type": "DEPOSIT",
        "amount": 1.00,
        "description": "Smoke test - safe to delete",
        "created_at": date.today().isoformat(),
    })
    show("created", f"txn {created['txn_id']}  {created['description']}")
    show("readable back", any(
        row["txn_id"] == created["txn_id"]
        for row in repository.find_by_account_id(ACCOUNT_ID)
    ))

    repository.collection.delete_one({"txn_id": created["txn_id"]})
    show("cleaned up", repository.collection.count_documents({"txn_id": created["txn_id"]}) == 0)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
