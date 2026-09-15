"""response shapes for transaction routes."""

from pydantic import BaseModel


class BaseTransactionResponse(BaseModel):
    txn_id: int
    display_id: str
    account_id: int
    txn_type: str
    description: str
    amount: float
    created_at: str
    date: str


class DepositTransactionResponse(BaseTransactionResponse):
    pass


class WithdrawalTransactionResponse(BaseTransactionResponse):
    category: str


TransactionResponse = DepositTransactionResponse | WithdrawalTransactionResponse


class TransactionHistoryResponse(BaseModel):
    account_id: int
    transaction_count: int
    transactions: list[TransactionResponse]
