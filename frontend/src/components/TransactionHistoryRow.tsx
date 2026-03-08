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
}

export function TransactionHistoryRow({ transaction: t }: TransactionHistoryRowProps) {
  const amountPrefix = t.action === "Buy" ? "+" : t.action === "Sell" ? "-" : "";
  const amountClass = t.action === "Buy" ? "transaction-history-table__buy" : t.action === "Sell" ? "transaction-history-table__sell" : "";

  return (
    <tr className="transaction-history-table__row">
      <td className="transaction-history-table__cell">{formatTimeMilitary(t.timestamp)}</td>
      <td className="transaction-history-table__cell">{t.action}</td>
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
    </tr>
  );
}
