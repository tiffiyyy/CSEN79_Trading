import { useState, useEffect } from "react";
import { TransactionHistory } from "../components/TransactionHistory";
import {
  getPendingTransactions,
  updateTransactionStatus,
  type TransactionRecord,
  fetchTransactions,
} from "../utils/transactionStorage";
import "./Transaction.css";

const USER_ID_KEY = "trading_user_id";

export function Transaction() {
  const [pendingTransactions, setPendingTransactions] = useState<TransactionRecord[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem(USER_ID_KEY);

  const loadTransactions = () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all([
      getPendingTransactions(userId),
      fetchTransactions(userId),
    ]).then(([pending, all]) => {
      setPendingTransactions(pending);
      setAllTransactions(all);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  };

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const handleCancelTransaction = async (orderId: string) => {
    if (!userId || !orderId) return;

    const success = await updateTransactionStatus(userId, orderId, "cancelled");
    if (success) {
      // Refresh the transactions list after cancellation
      loadTransactions();
    } else {
      alert("Failed to cancel order.");
    }
  };

  if (isLoading) {
    return <div className="page transaction-page">Loading transactions...</div>;
  }

  return (
    <div className="page transaction-page">
      <h2 className="page__title">Transactions</h2>
      {pendingTransactions.length > 0 && (
        <TransactionHistory
          title="Pending Orders"
          transactions={pendingTransactions}
          onCancel={handleCancelTransaction}
        />
      )}
      <TransactionHistory title="All Transactions" transactions={allTransactions} />
    </div>
  );
}
