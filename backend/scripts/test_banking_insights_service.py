"""Demo BankingInsightsService against MongoDB.

Run from the project root:
    python backend/scripts/test_banking_insights_service.py

"""

from datetime import date, datetime
from pathlib import Path
import sys

from dotenv import load_dotenv


# ---------------------------------------------------------------------------
# Presentation input
# ---------------------------------------------------------------------------

ACCOUNT_ID_TO_DEMO = 2


ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_DIR))

load_dotenv(ROOT_DIR / ".env")

from backend.app.database import client, db  # noqa: E402
from backend.app.services.banking_insights_service import BankingInsightsService  # noqa: E402


def print_section(title: str) -> None:
    print(f"\n{title}")
    print("-" * len(title))


def money(amount: float) -> str:
    return f"${amount:,.2f}"


def account_exists(account_id: int) -> bool:
    return db["accounts"].count_documents({"account_id": account_id}, limit=1) == 1


def print_summary(summary: dict) -> None:
    print_section("Recent Summary")
    print(f"Period: {summary['period_days']} days")
    print(f"Transactions: {summary['transaction_count']}")
    print(f"Deposits: {summary['deposit_count']} totaling {money(summary['total_deposits'])}")
    print(f"Withdrawals: {summary['withdrawal_count']} totaling {money(summary['total_withdrawals'])}")
    print(f"Net change: {money(summary['net_change'])}")


def print_spending_by_category(spending_by_category: list[dict]) -> None:
    print_section("Spending By Category")

    if not spending_by_category:
        print("No recent spending categories found.")
        return

    for category in spending_by_category:
        print(
            f"{category['category']}: "
            f"{money(category['amount'])} "
            f"({category['percentage']}%)"
        )


def print_monthly_cash_flow(monthly_cash_flow: list[dict]) -> None:
    print_section("Monthly Cash Flow")

    for month in monthly_cash_flow:
        print(
            f"{month['month']}: "
            f"deposits {money(month['deposits'])}, "
            f"withdrawals {money(month['withdrawals'])}"
        )


def print_trends(trends: dict) -> None:
    print_section("Trends")
    print(f"Current month spending: {money(trends['current_total_spending'])}")
    print(f"Previous month spending: {money(trends['previous_total_spending'])}")

    if trends["spending_change_percent"] is None:
        print("Spending change: not available because previous month spending is 0")
    else:
        print(f"Spending change: {trends['spending_change_percent']}%")

    print(f"Average weekly spend: {money(trends['average_weekly_spend'])}")

    if trends["top_spending_category"] is None:
        print("Top spending category: none")
    else:
        print(
            f"Top spending category: {trends['top_spending_category']} "
            f"({money(trends['top_spending_amount'])})"
        )


def print_demo_insights(service: BankingInsightsService, account_id: int) -> bool:
    print_section("Demo Input")
    print(f"Account ID: {account_id}")

    if not account_exists(account_id):
        print("Account ID not found.")
        print("Please enter a valid account_id in ACCOUNT_ID_TO_DEMO and run the script again.")
        return False

    transactions = service.get_account_transactions(account_id)
    print(f"Transactions retrieved from MongoDB: {len(transactions)}")

    if not transactions:
        print("No transactions were found for this account.")

    insights = service.get_insights(account_id)

    print_summary(insights["summary"])
    print_spending_by_category(insights["spending_by_category"])
    print_monthly_cash_flow(insights["monthly_cash_flow"])
    print_trends(insights["trends"])

    return True


def check(name: str, condition: bool, details: str = "") -> bool:
    if condition:
        print(f"PASS: {name}")
        return True

    message = f"FAIL: {name}"
    if details:
        message += f" - {details}"
    print(message)
    return False


def run_confidence_checks(service: BankingInsightsService, account_id: int) -> None:
    print_section("Confidence Checks")

    results = []

    client.admin.command("ping")
    results.append(check("MongoDB connection responds to ping", True))

    results.append(check(
        "demo account_id exists in MongoDB accounts collection",
        account_exists(account_id),
        f"account_id={account_id}",
    ))

    direct_count = db["transactions"].count_documents({"account_id": account_id})
    service_transactions = service.get_account_transactions(account_id)

    results.append(check(
        "service transaction count matches direct MongoDB count",
        len(service_transactions) == direct_count,
        f"service={len(service_transactions)}, mongo={direct_count}",
    ))
    results.append(check(
        "service transaction documents do not expose Mongo _id",
        all("_id" not in transaction for transaction in service_transactions),
    ))

    insights = service.get_insights(account_id)
    results.append(check(
        "insights response uses the requested account_id",
        insights["account_id"] == account_id,
    ))
    results.append(check(
        "monthly cash flow always has six month buckets",
        len(insights["monthly_cash_flow"]) == 6,
    ))

    missing_account_insights = service.get_insights(-1)
    results.append(check(
        "missing account returns zero recent transactions",
        missing_account_insights["summary"]["transaction_count"] == 0,
    ))
    results.append(check(
        "missing account returns no spending categories",
        missing_account_insights["spending_by_category"] == [],
    ))

    expected_date = date(2026, 9, 16)
    results.append(check(
        "date parser accepts ISO date strings",
        service.get_transaction_date({"created_at": "2026-09-16"}) == expected_date,
    ))
    results.append(check(
        "date parser accepts date objects",
        service.get_transaction_date({"created_at": expected_date}) == expected_date,
    ))
    results.append(check(
        "date parser accepts datetime objects",
        service.get_transaction_date({"created_at": datetime(2026, 9, 16, 14, 30)}) == expected_date,
    ))

    passed = sum(1 for result in results if result)
    total = len(results)
    print(f"\n{passed}/{total} confidence checks passed")

    if passed != total:
        raise SystemExit(1)


def main() -> None:
    service = BankingInsightsService()

    print("Banking Insights MongoDB Demo")
    print("=============================")
    account_was_found = print_demo_insights(service, ACCOUNT_ID_TO_DEMO)

    if not account_was_found:
        return

    run_confidence_checks(service, ACCOUNT_ID_TO_DEMO)


if __name__ == "__main__":
    main()
