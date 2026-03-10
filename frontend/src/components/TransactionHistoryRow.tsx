import type { TransactionRecord } from "../utils/transactionStorage";
import "./TransactionHistory.css";

function formatTimeMilitary(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "2-digit" });
  const time = d.toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${date} ${time}`;
}

function formatBalanceChange(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${n.toFixed(2)}`;
}

export interface TransactionHistoryRowProps {
  transaction: TransactionRecord;
  onCancel?: (orderId: string) => void;
  selected?: boolean;
  onSelect?: () => void;
}

export function TransactionHistoryRow({ transaction: t, onCancel, selected, onSelect }: TransactionHistoryRowProps) {
  const actionDisplay = t.action.charAt(0).toUpperCase() + t.action.slice(1);
  const isBuy = t.action.toLowerCase() === "buy";
  const isSell = t.action.toLowerCase() === "sell";
  const amountPrefix = isBuy ? "+" : isSell ? "-" : "";
  const amountClass = isBuy
    ? "transaction-history-table__buy"
    : isSell
    ? "transaction-history-table__sell"
    : "";
  const statusDisplay = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Executed";

  return (
    <tr
      className={`transaction-history-table__row ${selected ? "transaction-history-table__row--selected" : ""}`}
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <td className="transaction-history-table__cell">{formatTimeMilitary(t.timestamp)}</td>
      <td className={`transaction-history-table__cell ${amountClass}`}>{actionDisplay}</td>
      <td className="transaction-history-table__cell">{t.orderType}</td>
      <td className="transaction-history-table__cell">{t.symbol}</td>
      <td className="transaction-history-table__cell">{t.company}</td>
      <td className="transaction-history-table__cell">
        <span className={amountClass}>
          {amountPrefix}{t.amountBoughtSold} shares
        </span>
      </td>
      <td className="transaction-history-table__cell">
        <span className={t.balanceChange >= 0 ? "transaction-history-table__up" : "transaction-history-table__down"}>
          {formatBalanceChange(t.balanceChange)}
        </span>
      </td>
      <td className="transaction-history-table__cell">
        <span className={`transaction-history-table__status transaction-history-table__status--${t.status ?? 'executed'}`}>
          {statusDisplay}
        </span>
      </td>
      {onCancel && (
        <td className="transaction-history-table__cell transaction-history-table__cell--action">
          {t.status === "pending" && (
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(t.id);
              }}
            >
              Cancel
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
