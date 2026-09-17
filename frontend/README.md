# Frontend

React playground for the banking project components.

## Run locally

From `frontend/`:

```bash
npm install
npm run dev
```

The playground runs at `http://127.0.0.1:5173/playground` and calls the FastAPI backend at `http://127.0.0.1:8000` by default.

To point at a different backend URL, create a `.env` file in `frontend/`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```
