import { TransactionHistory } from "../components/TransactionHistory";
import "./Transaction.css";

export function Transaction() {
  return (
    <div className="page transaction-page">
      <h2 className="page__title">Transactions</h2>
      <TransactionHistory title="Transaction History" />
    </div>
  );
}
