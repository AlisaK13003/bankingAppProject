"""response shapes for transaction routes."""

from typing import Annotated, Literal

from pydantic import BaseModel
from pydantic import Field


class BaseTransactionResponse(BaseModel):
    txn_id: int
    display_id: str
    account_id: int
    description: str
    amount: float
    created_at: str
    date: str


class DepositTransactionResponse(BaseTransactionResponse):
    txn_type: Literal["DEPOSIT"]


class WithdrawalTransactionResponse(BaseTransactionResponse):
    txn_type: Literal["WITHDRAWAL"]
    category: str


TransactionResponse = Annotated[
    DepositTransactionResponse | WithdrawalTransactionResponse,
    Field(discriminator="txn_type"),
]


class TransactionHistoryResponse(BaseModel):
    account_id: int
    transaction_count: int
    transactions: list[TransactionResponse]


class TransactionSummaryResponse(BaseModel):
    account_id: int
    transaction_count: int
    deposit_count: int
    withdrawal_count: int
    deposits: float
    withdrawals: float
    net_change: float
