import { useState } from "react";
import type { TransactionRecord } from "../utils/transactionStorage";
import { TransactionHistoryRow } from "./TransactionHistoryRow";
import "./TransactionHistory.css";

function toLocalDateString(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface TransactionTablePanelProps {
  title: string;
  transactions: TransactionRecord[];
  compact?: boolean;
  showToolbar?: boolean;
  emptyMessage?: string;
  /** When set, rows are selectable and selectedId/onSelectRow are used. */
  selectedId?: string | null;
  onSelectRow?: (transaction: TransactionRecord | null) => void;
  onCancel?: (transaction: TransactionRecord) => void;
  cancelButtonLabel?: string;
}

export function TransactionTablePanel({
  title,
  transactions,
  compact = false,
  showToolbar = true,
  emptyMessage = "No transactions to display.",
  selectedId = null,
  onSelectRow,
  onCancel,
  cancelButtonLabel = "Cancel transaction",
}: TransactionTablePanelProps) {
  const selectable = onSelectRow != null;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const q = searchQuery.trim().toLowerCase();
  const filtered = transactions.filter((t) => {
    const matchSearch =
      !q ||
      t.symbol.toLowerCase().startsWith(q) ||
      t.company.toLowerCase().startsWith(q);
    const matchDate = !filterDate || toLocalDateString(t.timestamp) === filterDate;
    return matchSearch && matchDate;
  });

  return (
    <section className={`transaction-history ${compact ? "transaction-history--compact" : ""}`}>
      <div className="transaction-history-panel">
        <div className="transaction-history-panel__title">{title}</div>
        {showToolbar && (
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
        )}
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
                  <th className="transaction-history-table__th">Balance Change</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="transaction-history-table__empty">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <TransactionHistoryRow
                      key={t.id}
                      transaction={t}
                      selected={selectable && selectedId === t.id}
                      onSelect={
                        selectable
                          ? () =>
                              onSelectRow!(selectedId === t.id ? null : t)
                          : undefined
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {onCancel && (
            <div className="transaction-table-panel__cancel-wrap">
              <button
                type="button"
                className="btn btn--primary transaction-table-panel__cancel-btn"
                disabled={!selectedId}
                onClick={() => {
                  const t = transactions.find((x) => x.id === selectedId);
                  if (t) onCancel(t);
                }}
              >
                {cancelButtonLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
