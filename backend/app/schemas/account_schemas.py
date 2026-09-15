"""request and response shapes for account routes."""

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    created_at: str


class AccountResponse(BaseModel):
    account_id: int
    account_type: str
    balance: float
    created_at: str
    user: UserResponse

class UserAccountResponse(BaseModel):
    account_id: int
    account_type: str
    balance: float
    created_at: str

class UserAccountsResponse(BaseModel):
    user: UserResponse
    accounts: list[UserAccountResponse]

class AccountType(str, Enum):
    savings = "SAVINGS"
    checking = "CHECKING"


class AccountCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: int = Field(gt=0, alias="userId")
    account_type: AccountType = Field(alias="accountType")

class WithdrawalCategory(str, Enum):
    food_and_dining = "Food & Dining"
    shopping = "Shopping"
    entertainment = "Entertainment"
    transportation = "Transportation"
    bills = "Bills"
    other = "Other"


class DepositRequest(BaseModel):
    amount: float = Field(gt=0)
    description: str = ""


class WithdrawRequest(BaseModel):
    amount: float = Field(gt=0)
    category: WithdrawalCategory
    description: str = ""


class MoneyMovementResponse(BaseModel):
    account: AccountResponse
    transaction: dict
