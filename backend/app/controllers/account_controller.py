"""api routes for account details."""

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.account_schemas import AccountResponse, UserAccountsResponse
from backend.app.services.account_service import AccountService


router = APIRouter(tags=["Accounts"])
account_service = AccountService()


@router.get("/api/accounts/{account_id}", response_model=AccountResponse)
def get_account(account_id: int) -> dict:
    # get one account and its owner details
    account = account_service.get_account_details(account_id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return account


@router.get("/api/users/{user_id}/accounts", response_model=UserAccountsResponse)
def get_user_accounts(user_id: int) -> dict:
    # get all accounts for one user
    user_accounts = account_service.get_accounts_for_user(user_id)

    if not user_accounts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user_accounts
