# Banking App

A simple banking application built with a FastAPI backend, MongoDB Atlas data storage, and a future frontend.

## Backend Architecture

```text
API request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
MongoDB Atlas
```

* `controllers/` contains the API endpoints.
* `services/` contains business logic and calculations.
* `schemas/` defines and validates request and response data.
* `repositories/` contains database access code.
* `database.py` creates the shared MongoDB connection.
* `data/sample_data.py` still provides seed data and temporary fallback data for parts of the app that have not been migrated yet.

The backend is kept modular so each layer has one responsibility. This makes it easier to test the application and migrate one feature area at a time from sample data to MongoDB Atlas.

## Backend Structure

```text
backend/
  app/
    main.py
    database.py
    controllers/
    services/
    schemas/
    repositories/
    models/
    data/
      sample_data.py
  scripts/
    seed_mongodb.py
    test_banking_insights_service.py
  tests/
  requirements.txt
```

## Running the Backend

From the repository root:

```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

## Environment Setup

Create a local `.env` file in the repository root using `.env.example` as the template:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=banking_app
```

`MONGODB_URI` points to the MongoDB Atlas cluster.
`MONGODB_DB_NAME` controls which database the app uses.

## Seeding MongoDB

To load the current sample banking data into MongoDB Atlas, run:

```bash
python backend/scripts/seed_mongodb.py
```

The seed script loads users, accounts, and transactions from:

```text
backend/app/data/sample_data.py
```

## API Documentation

FastAPI provides interactive API documentation:

* Swagger UI: `http://127.0.0.1:8000/docs`
* ReDoc: `http://127.0.0.1:8000/redoc`

Open Swagger, select an endpoint, choose **Try it out**, enter a request body if needed, and select **Execute**.

## Main Endpoints

| Method | Endpoint                                           | Purpose                          |
| ------ | -------------------------------------------------- | -------------------------------- |
| GET    | `/health`                                          | Check whether the API is running |
| POST   | `/signup`                                          | Create a login user              |
| POST   | `/signin`                                          | Sign in                          |
| POST   | `/logout`                                          | Sign out                         |
| POST   | `/api/accounts`                                    | Make bank account                |
| GET    | `/api/accounts/{account_id}`                       | Get account details              |
| GET    | `/api/users/{user_id}/accounts`                    | Get all accounts for a user      |
| POST   | `/api/accounts/{account_id}/deposit`               | Deposit money                    |
| POST   | `/api/accounts/{account_id}/withdraw`              | Withdraw money                   |
| GET    | `/api/accounts/{account_id}/transactions`          | Get transaction history          |
| GET    | `/api/accounts/{account_id}/transactions/summary`  | Get transaction totals           |
| GET    | `/api/accounts/{account_id}/transactions/categories` | Get withdrawal categories      |
| GET    | `/api/accounts/{account_id}/insights`              | Get banking insights             |

## Current Data Setup

The backend is currently in the middle of the MongoDB migration.

Already migrated or partially migrated:

* MongoDB connection setup is in `backend/app/database.py`.
* User signup and signin use the `users` collection through `UserRepository`.
* Dashboard and banking insights are being updated to read from MongoDB repositories.
* `backend/scripts/seed_mongodb.py` can seed users, accounts, and transactions into MongoDB Atlas.

Not yet fully migrated:

* Account features are still being migrated. Until `AccountRepository` and `AccountService` are updated, account creation, account details, deposits, and withdrawals are not fully MongoDB-backed.
* Transaction features are still being migrated. Until `TransactionRepository` and `TransactionService` are updated, transaction history, transaction summaries, and transaction categories are not fully MongoDB-backed.

Because accounts and transactions are still in progress, some endpoints may still use `backend/app/data/sample_data.py` or may not run correctly until the missing repository work is completed.
