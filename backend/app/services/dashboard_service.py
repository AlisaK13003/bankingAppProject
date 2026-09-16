"""business logic for the dashboard shown after signup or sign-in."""

from backend.app.repositories.account_repository import AccountRepository


class DashboardService:

    def __init__(self) -> None:
        self.accounts = AccountRepository()

    # build the nav bar: this user's accounts, each linking to their
    # transaction history and insights, plus account details and logout
    def build_dashboard(self, user: dict) -> dict:
        user_id = user["user_id"]
        accounts = self.accounts.find_by_user_id(user_id)

        return {
            "account_details_path": f"/api/users/{user_id}/accounts",
            "accounts": [
                {
                    "account_id": account["account_id"],
                    "account_type": account["account_type"],
                    "balance": account["balance"],
                    "transactions_path": f"/api/accounts/{account['account_id']}/transactions",
                    "insights_path": f"/api/accounts/{account['account_id']}/insights",
                }
                for account in accounts
            ],
            "logout": {"label": "Log Out", "method": "POST", "path": "/logout"},
        }
