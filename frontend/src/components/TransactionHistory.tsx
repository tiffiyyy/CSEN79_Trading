import { useState } from "react";
import { getCurrentUsername } from "./ProtectedRoute";
import { type TransactionRecord } from "../utils/transactionStorage";
import { TransactionHistoryRow } from "./TransactionHistoryRow";
import "./TransactionHistory.css";

function toLocalDateString(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface TransactionHistoryProps {
  title?: string;
  compact?: boolean;
  transactions?: TransactionRecord[];
  onCancel?: (orderId: string) => void;
}

export function TransactionHistory({
  title = "Transaction History",
  compact = false,
  transactions = [],
  onCancel,
}: TransactionHistoryProps) {
  const username = getCurrentUsername();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const q = searchQuery.trim().toLowerCase();
  const filtered = transactions.filter((t) => {
    const matchSearch = !q || t.symbol.toLowerCase().includes(q) || t.company.toLowerCase().includes(q);
    const matchDate = !filterDate || toLocalDateString(t.timestamp) === filterDate;
    return matchSearch && matchDate;
  });

  if (!username) return null;

  return (
    <section className={`transaction-history ${compact ? "transaction-history--compact" : ""}`}>
      <div className="transaction-history-panel">
        <div className="transaction-history-panel__title">{title}</div>
        <div className="transaction-history-panel__toolbar">
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="transaction-history-panel__search-input"
            aria-label="Search transactions"
          />
          <label className="transaction-history-panel__date-label">
            <span>Date</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="transaction-history-panel__date-input"
              aria-label="Filter by date"
            />
          </label>
        </div>
        <div className="transaction-history-panel__content">
          <div className="transaction-history-table-wrap">
            <table className="transaction-history-table">
              <thead>
                <tr>
                  <th className="transaction-history-table__th">Time</th>
                  <th className="transaction-history-table__th">Action</th>
                  <th className="transaction-history-table__th">Order Type</th>
                  <th className="transaction-history-table__th">Symbol</th>
                  <th className="transaction-history-table__th">Company</th>
                  <th className="transaction-history-table__th">Amount</th>
                  <th className="transaction-history-table__th">Value</th>
                  <th className="transaction-history-table__th">Status</th>
                  {onCancel && <th className="transaction-history-table__th" />}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={onCancel ? 9 : 8} className="transaction-history-table__empty">
                      No transactions to display.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => <TransactionHistoryRow key={t.id} transaction={t} onCancel={onCancel} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
