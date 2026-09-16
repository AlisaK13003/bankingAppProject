"""MongoDB connection, shared by the repository layer.

Connection string comes from the MONGODB_URI env var, loaded from a local
.env file (see the team's shared contract -- MONGODB_URI, MONGODB_DB_NAME).
One client is created here and reused everywhere via `db`.
"""

import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "banking_app")

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]
