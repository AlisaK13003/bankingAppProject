"""mongodb atlas connection for the banking app.

Placeholder owned by the Atlas setup track (Person 4) - it follows the env
names published in the integration plan (MONGODB_URI, MONGODB_DB_NAME) so the
repositories have something to import while the cluster is being set up.

The connection is opened lazily on first use, not at import time. The
controllers build their services at import, so connecting here would stop
`backend.app.main` from importing at all on a machine without a .env file.
"""

import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

DEFAULT_DB_NAME = "banking_app"

_client: MongoClient | None = None
_database = None


# open the connection the first time a repository actually needs it
def get_database():
    global _client, _database

    if _database is None:
        uri = os.getenv("MONGODB_URI")

        if not uri:
            raise RuntimeError(
                "MONGODB_URI is not set. Copy .env.example to .env and paste the "
                "Atlas connection string before starting the API."
            )

        _client = MongoClient(uri)
        _database = _client[os.getenv("MONGODB_DB_NAME", DEFAULT_DB_NAME)]

    return _database


# one named collection from the banking_app database
def get_collection(name: str):
    return get_database()[name]


# cheap round trip so /health can prove the cluster is reachable
def ping() -> bool:
    get_database().client.admin.command("ping")
    return True
