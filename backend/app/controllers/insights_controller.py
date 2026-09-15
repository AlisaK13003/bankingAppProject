"""api routes for banking insights."""

from fastapi import APIRouter

from backend.app.services.banking_insights_service import BankingInsightsService


router = APIRouter(prefix="/api/accounts", tags=["Banking Insights"])
insights_service = BankingInsightsService()


@router.get("/{account_id}/insights")
def get_banking_insights(account_id: int) -> dict:
    # call the service layer to calculate insights for one account
    return insights_service.get_insights(account_id)
