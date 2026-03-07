import { useNavigate } from "react-router-dom";
import { setAuthenticated } from "../components/ProtectedRoute";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    setAuthenticated();
    navigate("/selection");
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Log in</h1>
        <p className="login-card__subtitle">Sign in to start trading</p>
        <button
          type="button"
          className="btn btn--primary login-card__btn"
          onClick={handleLogin}
        >
          Log in
        </button>
      </div>
    </main>
  );
}
