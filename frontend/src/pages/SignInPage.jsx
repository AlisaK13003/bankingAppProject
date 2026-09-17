import { useState } from "react";
import { setToken } from "../api/auth";
import { extractUserId, signIn } from "../api/bankingApi";
import { Button, StatusPanel, TextField } from "../components";

export function SignInPage({ onSignedIn, onCreateAccount, onBackHome }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await signIn({ username: username.trim(), password });
      setToken(response.access_token);
      onSignedIn(extractUserId(response));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <h1 className="auth-title">Sign In to Your Account</h1>
      <p className="auth-subtitle">Use your Polaris username and password to continue.</p>

      <StatusPanel state="error" message={error} />

      <form className="auth-card" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={setUsername}
        />
        <TextField
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={setPassword}
        />
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <Button onClick={onCreateAccount} variant="light">
        New to Polaris? Create an account
      </Button>
      <Button onClick={onBackHome} variant="light">
        Back to home
      </Button>
    </main>
  );
}
