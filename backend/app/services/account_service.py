"""business logic for account details."""

from backend.app.data.sample_data import accounts, users


class AccountService:

    # find a user by their id in the temporary sample data
    def get_user_by_id(self, user_id: int) -> dict | None:
        for user in users:
            if user["user_id"] == user_id:
                return user
        return None

    # find one account by account id
    def get_account_by_id(self, account_id: int) -> dict | None:
        for account in accounts:
            if account["account_id"] == account_id:
                return account
        return None

    # format one account with its user details
    def get_account_details(self, account_id: int) -> dict | None:
        account = self.get_account_by_id(account_id)

        if not account:
            return None

        user = self.get_user_by_id(account["user_id"])

        if not user:
            return None

        return self.format_account(account, user)

    # get every account that belongs to one user
    def get_accounts_for_user(self, user_id: int) -> dict | None:
        user = self.get_user_by_id(user_id)

        if not user:
            return None

        user_accounts = []

        for account in accounts:
            if account["user_id"] == user_id:
                user_accounts.append(self.format_account(account, user))

        return {
            "user_id": user["user_id"],
            "user_name": user["name"],
            "accounts": user_accounts,
        }

    # keep the api response shape in one place
    def format_account(self, account: dict, user: dict) -> dict:
        return {
            "account_id": account["account_id"],
            "user_id": account["user_id"],
            "user_name": user["name"],
            "user_email": user["email"],
            "account_type": account["account_type"],
            "balance": account["balance"],
            "created_at": account["created_at"],
        }
