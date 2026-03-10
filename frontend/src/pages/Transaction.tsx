import { useState, useEffect } from "react";
import { getCurrentUsername } from "../components/ProtectedRoute";
import { TransactionTablePanel } from "../components/TransactionTablePanel";
import { TransactionHistory } from "../components/TransactionHistory";
import {
  getTransactions,
  getPendingTransactions,
  updateTransactionStatus,
  addTransaction,
} from "../utils/transactionStorage";
import type { TransactionRecord } from "../utils/transactionStorage";
import "./Transaction.css";

export function Transaction() {
  const username = getCurrentUsername();
  const [pendingTransactions, setPendingTransactions] = useState<TransactionRecord[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionRecord[]>([]);
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      setAllTransactions(getTransactions(username));
      setPendingTransactions(getPendingTransactions(username));
    }
  }, [username]);

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
    <div className="page transaction-page">
      <h2 className="page__title">Transactions</h2>
      {username && (
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
      )}
      <TransactionHistory title="Transaction History" compact />
    </div>
  );
}
