"""business logic for the dashboard shown after signup or sign-in."""

from backend.app.services.account_service import AccountService


class DashboardService:

    def __init__(self) -> None:
        self.account_service = AccountService()

    # build the nav bar: this user's accounts, each linking to their
    # transaction history and insights, plus account details and logout
    def build_dashboard(self, user: dict) -> dict:
        user_id = user["user_id"]
        user_accounts = self.account_service.get_accounts_for_user(user_id)
        accounts = user_accounts["accounts"] if user_accounts else []

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
