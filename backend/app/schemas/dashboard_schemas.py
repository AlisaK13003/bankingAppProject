"""response shapes for the dashboard."""

from pydantic import BaseModel


class NavItem(BaseModel):
    label: str
    method: str
    path: str


class AccountNav(BaseModel):
    account_id: int
    account_type: str
    balance: float
    transactions_path: str
    insights_path: str


class DashboardResponse(BaseModel):
    account_details_path: str
    accounts: list[AccountNav]
    logout: NavItem
