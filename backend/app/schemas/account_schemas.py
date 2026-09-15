"""response shapes for account routes."""

from pydantic import BaseModel


class AccountResponse(BaseModel):
    account_id: int
    user_id: int
    user_name: str
    user_email: str
    account_type: str
    balance: float
    created_at: str


class UserAccountsResponse(BaseModel):
    user_id: int
    user_name: str
    accounts: list[AccountResponse]
