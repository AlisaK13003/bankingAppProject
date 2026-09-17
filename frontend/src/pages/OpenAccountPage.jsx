import { useState } from "react";
import { createAccount } from "../api/bankingApi";
import { Button, EmptyState, SelectField, StatusPanel } from "../components";

export function OpenAccountPage({ pendingUserId, onOpened, onBackToProfile }) {
  const [accountType, setAccountType] = useState("CHECKING");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!pendingUserId) {
    return (
      <main className="page-shell auth-page">
        <span className="auth-step">Step 2 of 2</span>
        <h1 className="auth-title">Open Your First Account</h1>
        <div className="auth-card">
          <EmptyState
            title="Create your profile first"
            message="We need a profile before you can open an account."
          />
        </div>
        <Button onClick={onBackToProfile} variant="light">
          Back to profile
        </Button>
      </main>
    );
  }

  async function handleOpenAccount(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createAccount({ userId: pendingUserId, accountType });
      onOpened(pendingUserId);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <span className="auth-step">Step 2 of 2</span>
      <h1 className="auth-title">Open Your First Account</h1>
      <p className="auth-subtitle">Choose the account type you want to start with.</p>

      <StatusPanel state="error" message={error} />

      <form className="auth-card" onSubmit={handleOpenAccount}>
        <SelectField label="Account Type" value={accountType} onChange={setAccountType}>
          <option value="CHECKING">Checking</option>
          <option value="SAVINGS">Savings</option>
        </SelectField>
        <p className="field-hint">
          New accounts start with a $0.00 balance. You can add another account later.
        </p>
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? "Opening..." : "Open Account"}
        </button>
      </form>

      <Button onClick={onBackToProfile} variant="light">
        Back to profile
      </Button>
    </main>
  );
}
