import { useNavigate } from "react-router-dom";
import { getCurrentUsername, clearAuthenticated } from "../components/ProtectedRoute";
import "./Profile.css";

export function Profile() {
  const navigate = useNavigate();
  const username = getCurrentUsername();

  const handleLogOut = () => {
    clearAuthenticated();
    navigate("/login", { replace: true });
  };

  return (
    <main className="profile-page">
      <h1 className="profile-page__title">Profile</h1>
      {username && (
        <p className="profile-page__username">{username}</p>
      )}
      <p className="profile-page__subtitle">Your trading statistics</p>

      <section className="profile-stats">
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Total trades</span>
          <span className="profile-stat-card__value">—</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Portfolio value</span>
          <span className="profile-stat-card__value">—</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Open positions</span>
          <span className="profile-stat-card__value">—</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-card__label">Total return</span>
          <span className="profile-stat-card__value">—</span>
        </div>
      </section>

      <button type="button" className="profile-page__logout btn btn--primary" onClick={handleLogOut}>
        Log out
      </button>
    </main>
  );
}
