import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, setAuthenticated, getCurrentUsername } from "../components/ProtectedRoute";
import "./Login.css";
import { createAccount, setUserId } from "../utils/apiCalls";

export function Login() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const [mode, setMode] = useState<"create" | "signin">("signin");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleCreateAccount = useCallback(async () => {
    setError("");
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter a username");
      return;
    }
    
    try {
      const result = await createAccount(trimmed);
      // Check if the response contains an error
      if (result && typeof result === "object" && "error" in result) {
        if (result.error === "name_taken") {
          setError("Username already taken. Please choose another.");
        } else {
          setError("Failed to create account. Please try again.");
        }
        return;
      }
      
      // Save the user ID from the response
      if (result && typeof result === "object" && "userId" in result) {
        const userId = result.userId as number;
        setUserId(userId);
      }
      
      setAuthenticated(trimmed);
      navigate("/selection");
    } catch (err: unknown) {
      console.error("Failed to create account:", err);
      setError("Failed to create account. Please try again.");
    }
  }, [username, navigate]);

  const handleSignIn = useCallback(() => {
    setError("");
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter your username");
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
    const currentUser = getCurrentUsername();
    return (
      <main className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">Log in</h1>
          <p className="login-card__subtitle">
            You are already logged in as {currentUser ?? "unknown"}.
          </p>
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
