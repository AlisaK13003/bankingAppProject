"""api routes for transaction history."""

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.transaction_schemas import TransactionHistoryResponse
from backend.app.services.transaction_service import TransactionService


router = APIRouter(prefix="/api/accounts", tags=["Transactions"])
transaction_service = TransactionService()


@router.get("/{account_id}/transactions", response_model=TransactionHistoryResponse)
def get_transactions(account_id: int) -> dict:
    # get the transaction history for one account
    history = transaction_service.get_transactions_for_account(account_id)

    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return history
