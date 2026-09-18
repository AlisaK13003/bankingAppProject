"""Ownership checks for the banking routes.

Authentication answers "who are you" - that is get_current_user in
backend/app/dependencies.py. These answer the question that actually protects
the app: "is this your money?"

Since the project has one kind of user, the access rule is ownership rather
than admin-vs-user. If the token says user 7, then user 7 reaches user 7's
accounts and nothing else.

    GET /api/users/7/accounts   -> 200 for user 7
    GET /api/users/8/accounts   -> 403 for user 7
    GET /api/accounts/12        -> 200 only if account 12 belongs to user 7

Status codes, per the team's split document:

    401  no token, expired token, invalid token   (dependencies.py)
    403  a real signed-in user reaching data that is not theirs
    404  the account genuinely does not exist

This lives beside dependencies.py rather than inside a dependencies/ package:
a package of that name would shadow the module and hide get_current_user.
"""

from fastapi import Depends, HTTPException, Path, status

from backend.app.dependencies import get_current_user
from backend.app.repositories.account_repository import AccountRepository


FORBIDDEN_DETAIL = "You do not have permission to access this account."
NOT_FOUND_DETAIL = "Account not found."

_accounts = AccountRepository()


def _forbidden() -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=FORBIDDEN_DETAIL)


# guards every route keyed by {account_id}: account details, deposit,
# withdraw, transaction history, transaction summary, categories, insights
def require_account_access(
    account_id: int = Path(..., ge=1),
    current_user: dict = Depends(get_current_user),
) -> dict:
    account = _accounts.find_by_id(account_id)

    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_DETAIL)

    if account.get("user_id") != current_user["user_id"]:
        raise _forbidden()

    return current_user


# guards the routes keyed by {user_id}, so one customer cannot list another
# customer's accounts
def require_user_access(
    user_id: int = Path(..., ge=1),
    current_user: dict = Depends(get_current_user),
) -> dict:
    if user_id != current_user["user_id"]:
        raise _forbidden()

    return current_user


# for a body-supplied user_id, such as opening an account. Called directly by
# the controller rather than through Depends, because the id arrives in the
# payload rather than the path.
def check_user_matches_token(user_id: int, current_user: dict) -> None:
    if user_id != current_user["user_id"]:
        raise _forbidden()
