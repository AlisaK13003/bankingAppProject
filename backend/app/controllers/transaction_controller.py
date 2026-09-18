"""api routes for transaction history."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.app.ownership import require_account_access
from backend.app.schemas.account_schemas import WithdrawalCategory
from backend.app.schemas.transaction_schemas import (
    TransactionHistoryResponse,
    TransactionSummaryResponse,
)
from backend.app.services.transaction_service import TransactionService


router = APIRouter(prefix="/api/accounts", tags=["Transactions"])
transaction_service = TransactionService()


@router.get("/{account_id}/transactions", response_model=TransactionHistoryResponse)
def get_transactions(
    account_id: int,
    txn_type: str | None = Query(default=None, alias="type"),
    category: str | None = None,
    search: str | None = None,
    date_from: date | None = Query(default=None, alias="from"),
    date_to: date | None = Query(default=None, alias="to"),
    current_user: dict = Depends(require_account_access),
) -> dict:
    # get the transaction history for one account
    history = transaction_service.get_transactions_for_account(
        account_id=account_id,
        txn_type=txn_type,
        category=category,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )

    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return history


@router.get("/{account_id}/transactions/summary", response_model=TransactionSummaryResponse)
def get_transaction_summary(
    account_id: int,
    date_from: date | None = Query(default=None, alias="from"),
    date_to: date | None = Query(default=None, alias="to"),
    current_user: dict = Depends(require_account_access),
) -> dict:
    # get deposit, withdrawal, and net totals for the selected date range
    summary = transaction_service.get_transaction_summary(
        account_id=account_id,
        date_from=date_from,
        date_to=date_to,
    )

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return summary


@router.get("/{account_id}/transactions/categories", response_model=list[str])
def get_transaction_categories(
    account_id: int,
    current_user: dict = Depends(require_account_access),
) -> list[str]:
    # return the category dropdown values for one existing account
    account = transaction_service.account_service.get_account_by_id(account_id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return [category.value for category in WithdrawalCategory]
