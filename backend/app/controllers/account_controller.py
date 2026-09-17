"""api routes for account details."""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.dependencies import get_current_user
from backend.app.ownership import (
    check_user_matches_token,
    require_account_access,
    require_user_access,
)
from backend.app.schemas.account_schemas import (
    AccountCreateRequest,
    AccountResponse,
    DepositRequest,
    MoneyMovementResponse,
    UserAccountsResponse,
    WithdrawRequest,
)
from backend.app.services.account_service import (
    AccountService,
    InsufficientFundsError,
    InvalidAmountError,
)


router = APIRouter(tags=["Accounts"])
account_service = AccountService()

@router.post(
    "/api/accounts",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_bank_account(
    payload: AccountCreateRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    # the user id arrives in the body here, so check it against the token
    check_user_matches_token(payload.user_id, current_user)

    # create a bank account for an existing user
    account = account_service.create_account(
        user_id=payload.user_id,
        account_type=payload.account_type.value,
    )

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return account

@router.get("/api/accounts/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    current_user: dict = Depends(require_account_access),
) -> dict:
    # get one account and its owner details
    account = account_service.get_account_details(account_id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return account


@router.get("/api/users/{user_id}/accounts", response_model=UserAccountsResponse)
def get_user_accounts(
    user_id: int,
    current_user: dict = Depends(require_user_access),
) -> dict:
    # get all accounts for one user
    user_accounts = account_service.get_accounts_for_user(user_id)

    if not user_accounts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user_accounts


@router.post("/api/accounts/{account_id}/deposit", response_model=MoneyMovementResponse)
def deposit(
    account_id: int,
    payload: DepositRequest,
    current_user: dict = Depends(require_account_access),
) -> dict:
    # add money to the account and record the transaction
    try:
        result = account_service.deposit(
            account_id=account_id,
            amount=payload.amount,
            description=payload.description,
        )
    except InvalidAmountError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return result


@router.post("/api/accounts/{account_id}/withdraw", response_model=MoneyMovementResponse)
def withdraw(
    account_id: int,
    payload: WithdrawRequest,
    current_user: dict = Depends(require_account_access),
) -> dict:
    # remove money from the account and record the transaction
    try:
        result = account_service.withdraw(
            account_id=account_id,
            amount=payload.amount,
            category=payload.category.value,
            description=payload.description,
        )
    except InvalidAmountError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except InsufficientFundsError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found.",
        )

    return result
