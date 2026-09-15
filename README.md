# Banking App

A simple banking application built with a FastAPI backend and a frontend.

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
Database
```

* `controllers/` contains the API endpoints.
* `services/` contains business logic and calculations.
* `schemas/` defines and validates request and response data.
* `repositories/` is reserved for database access.
* `data/sample_data.py` currently provides temporary in-memory data.

The backend is kept modular so each layer has one responsibility. This makes it easier to test the application and replace the sample data with MongoDB Atlas later.

## Backend Structure

```text
backend/
  app/
    main.py
    controllers/
    services/
    schemas/
    repositories/
    models/
    data/
      sample_data.py
    temp/
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

## API Documentation

FastAPI provides interactive API documentation:

* Swagger UI: `http://127.0.0.1:8000/docs`
* ReDoc: `http://127.0.0.1:8000/redoc`

Open Swagger, select an endpoint, choose **Try it out**, enter a request body if needed, and select **Execute**.

## Main Endpoints

| Method | Endpoint                                  | Purpose                          |
| ------ | ----------------------------------------- | -------------------------------- |
| GET    | `/health`                                 | Check whether the API is running |
| POST   | `/signup`                                 | Create an account                |
| POST   | `/signin`                                 | Sign in                          |
| POST   | `/api/accounts`                           | Make bank account                |
| GET    | `/api/accounts/{account_id}`              | Get account details              |
| GET    | `/api/users/{user_id}/accounts`           | Get all accounts for a user      |
| POST   | `/api/accounts/{account_id}/deposit`      | Deposit money                    |
| POST   | `/api/accounts/{account_id}/withdraw`     | Withdraw money                   |
| GET    | `/api/accounts/{account_id}/transactions` | Get transaction history          |
| GET    | `/api/accounts/{account_id}/insights`     | Get banking insights             |

## Current Data Setup

The backend currently uses sample data instead of a database.

Data is stored in:

```text
backend/app/data/sample_data.py
```

Deposits and withdrawals only last while the server is running. Restarting the server resets the sample data.

MongoDB Atlas will be connected later through the repository layer.
