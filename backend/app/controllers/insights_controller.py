"""api routes for banking insights."""

from fastapi import APIRouter, Depends

from backend.app.ownership import require_account_access
from backend.app.schemas.insights_schemas import BankingInsightsResponse
from backend.app.services.banking_insights_service import BankingInsightsService


router = APIRouter(prefix="/api/accounts", tags=["Banking Insights"])
insights_service = BankingInsightsService()


@router.get("/{account_id}/insights", response_model=BankingInsightsResponse)
def get_banking_insights(
    account_id: int,
    current_user: dict = Depends(require_account_access),
) -> dict:
    # call the service layer to calculate insights for one account
    return insights_service.get_insights(account_id)
