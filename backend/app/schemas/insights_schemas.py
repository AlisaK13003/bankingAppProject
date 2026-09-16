"""response shapes for banking insights."""

from pydantic import BaseModel


class RecentSummaryResponse(BaseModel):
    period_days: int
    transaction_count: int
    deposit_count: int
    withdrawal_count: int
    total_deposits: float
    total_withdrawals: float
    net_change: float


class SpendingCategoryResponse(BaseModel):
    category: str
    amount: float
    percentage: float


class MonthlyCashFlowResponse(BaseModel):
    month: str
    deposits: float
    withdrawals: float


class TrendsResponse(BaseModel):
    current_total_spending: float
    previous_total_spending: float
    spending_change_percent: float | None
    average_weekly_spend: float
    top_spending_category: str | None
    top_spending_amount: float


class BankingInsightsResponse(BaseModel):
    account_id: int
    summary: RecentSummaryResponse
    spending_by_category: list[SpendingCategoryResponse]
    monthly_cash_flow: list[MonthlyCashFlowResponse]
    trends: TrendsResponse
