# Banking App Frontend

React/Vite frontend for the banking application. It supports signup, signin, account creation, account dashboards, transactions, insights, and sign-out.

## Run Locally

From `frontend/`:

```bash
npm install
npm run dev
```

The app runs at:

```text
http://127.0.0.1:5173
```

By default, it calls the FastAPI backend at:

```text
http://127.0.0.1:8000
```

To point at a different backend URL, create a `.env` file in `frontend/`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Auth

The frontend stores the JWT returned by signup/signin in local storage under:

```text
banking_app_token
```

Protected API calls send:

```text
Authorization: Bearer <token>
```

Sign-out clears the stored token.

## Build

```bash
npm run build
```
