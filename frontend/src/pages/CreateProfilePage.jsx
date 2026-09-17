import { useState } from "react";
import { setToken } from "../api/auth";
import { extractUserId, signup } from "../api/bankingApi";
import { Button, StatusPanel, TextField } from "../components";

export function CreateProfilePage({ draft, onDraftChange, onContinue, onBackHome }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field) {
    return (value) => onDraftChange((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!draft.username.trim() || !draft.name.trim() || !draft.email.trim() || !draft.password) {
      setError("Fill in every field to continue.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await signup({
        username: draft.username.trim(),
        name: draft.name.trim(),
        email: draft.email.trim(),
        password: draft.password,
      });
      setToken(response.access_token);
      onContinue(extractUserId(response));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <span className="auth-step">Step 1 of 2</span>
      <h1 className="auth-title">Create Your Profile</h1>
      <p className="auth-subtitle">Enter your details first. You will open your first account next.</p>

      <StatusPanel state="error" message={error} />

      <form className="auth-card" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          placeholder="Choose a username"
          value={draft.username}
          onChange={updateField("username")}
        />
        <TextField
          label="Name"
          placeholder="Your Full Name"
          value={draft.name}
          onChange={updateField("name")}
        />
        <TextField
          label="Email"
          placeholder="you@example.com"
          value={draft.email}
          onChange={updateField("email")}
        />
        <div>
          <TextField
            label="Password"
            placeholder="Choose a password"
            type="password"
            value={draft.password}
            onChange={updateField("password")}
          />
          <p className="field-hint">
            8+ characters, no spaces, with at least 1 uppercase letter and 1 special character
          </p>
        </div>
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Continue"}
        </button>
      </form>

      <Button onClick={onBackHome} variant="light">
        Back to home
      </Button>
    </main>
  );
}
