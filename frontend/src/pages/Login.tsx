import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, setAuthenticated } from "../components/ProtectedRoute";
import "./Login.css";

const USERNAMES_KEY = "trading_usernames";

function getUsernames(): string[] {
  try {
    const raw = localStorage.getItem(USERNAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setUsernames(usernames: string[]): void {
  localStorage.setItem(USERNAMES_KEY, JSON.stringify(usernames));
}

export function Login() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const [mode, setMode] = useState<"create" | "signin">("signin");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleCreateAccount = useCallback(() => {
    setError("");
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter a username");
      return;
    }
    const usernames = getUsernames();
    if (usernames.includes(trimmed)) {
      setError("Username already taken");
      return;
    }
    setUsernames([...usernames, trimmed]);
    setAuthenticated(trimmed);
    navigate("/selection");
  }, [username, navigate]);

  const handleSignIn = useCallback(() => {
    setError("");
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter your username");
      return;
    }
    const usernames = getUsernames();
    if (!usernames.includes(trimmed)) {
      setError("Username not found");
      return;
    }
    setAuthenticated(trimmed);
    navigate("/selection");
  }, [username, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") handleCreateAccount();
    else handleSignIn();
  };

  const switchMode = () => {
    setMode((m) => (m === "create" ? "signin" : "create"));
    setError("");
    setUsername("");
  };

  if (loggedIn) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">Log in</h1>
          <p className="login-card__subtitle">You are already logged in.</p>
          <button
            type="button"
            className="btn btn--primary login-card__btn"
            onClick={() => navigate("/selection")}
          >
            Go to Selection
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">
          {mode === "create" ? "Create account" : "Log in"}
        </h1>
        <p className="login-card__subtitle">
          {mode === "create"
            ? "Choose a username to get started"
            : "Enter your username to sign in"}
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="login-username" className="login-form__label">
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            className="login-form__input"
            placeholder="Username"
            autoComplete={mode === "create" ? "username" : "username"}
            autoFocus
          />
          {error && <p className="login-form__error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--primary login-card__btn">
            {mode === "create" ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          className="login-card__switch"
          onClick={switchMode}
        >
          {mode === "create"
            ? "Already have an account? Sign in"
            : "Create an account"}
        </button>
      </div>
    </main>
  );
}
