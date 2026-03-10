import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername, clearAuthenticated } from "../components/ProtectedRoute";
import { TransactionTablePanel } from "../components/TransactionTablePanel";
import {
  getTransactions,
  getPendingTransactions,
  updateTransactionStatus,
  addTransaction,
} from "../utils/transactionStorage";
import type { TransactionRecord } from "../utils/transactionStorage";
import "./Profile.css";

export function Profile() {
  const navigate = useNavigate();
  const username = getCurrentUsername();
  const [allTransactions, setAllTransactions] = useState<TransactionRecord[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<TransactionRecord[]>([]);
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      setAllTransactions(getTransactions(username));
      setPendingTransactions(getPendingTransactions(username));
    }
  }, [username]);

  const handleLogOut = () => {
    clearAuthenticated();
    navigate("/login", { replace: true });
  };

  const handleCancelPending = (transaction: TransactionRecord) => {
    if (!username) return;
    updateTransactionStatus(username, transaction.id, "CANCELLED");
    addTransaction(username, {
      action: "Cancel",
      orderType: transaction.orderType,
      balanceChange: 0,
      amountBoughtSold: transaction.amountBoughtSold,
      symbol: transaction.symbol,
      company: transaction.company,
      timestamp: Date.now(),
    });
    setAllTransactions(getTransactions(username));
    setPendingTransactions(getPendingTransactions(username));
    setSelectedPendingId(null);
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

      {username && (
        <>
          <TransactionTablePanel
            title="Pending Transactions"
            transactions={pendingTransactions}
            compact
            showToolbar
            emptyMessage="No pending transactions."
            selectedId={selectedPendingId}
            onSelectRow={(tx) => setSelectedPendingId(tx?.id ?? null)}
            onCancel={handleCancelPending}
            cancelButtonLabel="Cancel transaction"
          />
          <TransactionTablePanel
            title="Transaction History"
            transactions={allTransactions}
            compact
            showToolbar
            emptyMessage="No transactions to display."
          />
        </>
      )}

      <button type="button" className="profile-page__logout btn btn--primary" onClick={handleLogOut}>
        Log out
      </button>
    </main>
  );
}
