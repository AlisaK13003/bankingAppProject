"""business logic for account details and balance changes."""

from datetime import date

from backend.app.data.sample_data import accounts, users
from backend.app.repositories.transaction_repository import TransactionRepository


class InvalidAmountError(ValueError):
    pass


class InsufficientFundsError(ValueError):
    pass


class AccountService:

    def __init__(self, transaction_repository: TransactionRepository | None = None) -> None:
        self.transaction_repository = transaction_repository or TransactionRepository()

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

    # create a new zero-balance account for an existing user
    def create_account(self, user_id: int, account_type: str) -> dict | None:
        user = self.get_user_by_id(user_id)

        if not user:
            return None

        next_account_id = max(
            account["account_id"] for account in accounts
        ) + 1

        account = {
            "account_id": next_account_id,
            "user_id": user_id,
            "balance": 0.0,
            "account_type": account_type,
            "created_at": date.today().isoformat(),
        }

        accounts.append(account)

        return self.format_account(account, user)

    # get every account that belongs to one user
    def get_accounts_for_user(self, user_id: int) -> dict | None:
        user = self.get_user_by_id(user_id)

        if not user:
            return None

        user_accounts = []

        for account in accounts:
            if account["user_id"] == user_id:
                user_accounts.append(self.format_account_summary(account))

        return {
            "user": self.format_user(user),
            "accounts": user_accounts,
        }

    # keep the api response shape in one place
    def format_account(self, account: dict, user: dict) -> dict:
        return {
            "account_id": account["account_id"],
            "account_type": account["account_type"],
            "balance": account["balance"],
            "created_at": account["created_at"],
            "user": self.format_user(user),
        }

    # format an account without repeating the user details
    def format_account_summary(self, account: dict) -> dict:
        return {
            "account_id": account["account_id"],
            "account_type": account["account_type"],
            "balance": account["balance"],
            "created_at": account["created_at"],
        }

    # keep the nested user response shape in one place
    def format_user(self, user: dict) -> dict:
        return {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"],
        }

    # add money to one account and record the deposit
    def deposit(
        self,
        account_id: int,
        amount: float,
        category: str = "-",
        description: str = "",
    ) -> dict | None:
        account = self.get_account_by_id(account_id)

        if not account:
            return None

        self.validate_positive_amount(amount)

        account["balance"] = round(account["balance"] + amount, 2)
        transaction = self.add_transaction(
            account_id=account_id,
            txn_type="DEPOSIT",
            amount=amount,
            category=category or "-",
            description=description,
        )

        return {
            "account": self.get_account_details(account_id),
            "transaction": transaction,
        }

    # remove money from one account and record the withdrawal
    def withdraw(
        self,
        account_id: int,
        amount: float,
        category: str = "General",
        description: str = "",
    ) -> dict | None:
        account = self.get_account_by_id(account_id)

        if not account:
            return None

        self.validate_positive_amount(amount)

        if amount > account["balance"]:
            raise InsufficientFundsError("Cannot withdraw more than the account balance.")

        account["balance"] = round(account["balance"] - amount, 2)
        transaction = self.add_transaction(
            account_id=account_id,
            txn_type="WITHDRAWAL",
            amount=amount,
            category=category or "General",
            description=description,
        )

        return {
            "account": self.get_account_details(account_id),
            "transaction": transaction,
        }

    # make sure money movement amounts follow the business rule
    def validate_positive_amount(self, amount: float) -> None:
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive.")

    # write one transaction to the transactions collection.
    # the balance still moves in the sample data above - that switches to
    # AccountRepository.update_balance when the account details track lands.
    def add_transaction(
        self,
        account_id: int,
        txn_type: str,
        amount: float,
        category: str,
        description: str = "",
    ) -> dict:
        transaction = {
            "txn_id": self.transaction_repository.next_transaction_id(),
            "account_id": account_id,
            "txn_type": txn_type,
            "amount": round(amount, 2),
            "description": description or f"{txn_type.title()} transaction",
            "created_at": date.today().isoformat(),
        }

        if txn_type == "WITHDRAWAL":
            transaction["category"] = category

        return self.transaction_repository.create_transaction(transaction)
