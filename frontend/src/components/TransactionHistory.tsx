import { getCurrentUsername } from "./ProtectedRoute";
import { getTransactions } from "../utils/transactionStorage";
import { TransactionTablePanel } from "./TransactionTablePanel";
import "./TransactionHistory.css";

interface TransactionHistoryProps {
  title?: string;
  compact?: boolean;
}

export function TransactionHistory({
  title = "Transaction History",
  compact = false,
}: TransactionHistoryProps) {
  const username = getCurrentUsername();
  const transactions = username ? getTransactions(username) : [];

  if (!username) return null;

  return (
    <TransactionTablePanel
      title={title}
      transactions={transactions}
      compact={compact}
      showToolbar
      emptyMessage="No transactions to display."
    />
  );
}
