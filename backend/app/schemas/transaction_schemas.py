"""response shapes for transaction routes."""

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    txn_id: int
    account_id: int
    txn_type: str
    amount: float
    category: str
    created_at: str


class TransactionHistoryResponse(BaseModel):
    account_id: int
    transaction_count: int
    transactions: list[TransactionResponse]
