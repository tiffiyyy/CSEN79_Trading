import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername, clearAuthenticated } from "../components/ProtectedRoute";
import { TransactionHistory } from "../components/TransactionHistory";
import { fetchTransactions, type TransactionRecord } from "../utils/transactionStorage";
import "./Profile.css";

// NOTE: Assuming the user ID is stored in localStorage after login.
const USER_ID_KEY = "trading_user_id";

export function Profile() {
  const navigate = useNavigate();
  const username = getCurrentUsername();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem(USER_ID_KEY);
    if (userId) {
      fetchTransactions(userId).then(setTransactions);
    }
  }, []);

  const handleLogOut = () => {
    clearAuthenticated();
    // Also clear user ID from local storage on log out
    localStorage.removeItem(USER_ID_KEY);
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

      <TransactionHistory title="Transaction History" compact transactions={transactions} />

      <button type="button" className="profile-page__logout btn btn--primary" onClick={handleLogOut}>
        Log out
      </button>
    </main>
  );
}
