export type TransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface TransactionRecord {
  id: string;
  action: string;
  orderType: string;
  balanceChange: number;
  amountBoughtSold: number;
  symbol: string;
  company: string;
  timestamp: number;
  status?: TransactionStatus;
}

const PREFIX = "trading_transactions_";

function key(username: string): string {
  return `${PREFIX}${username}`;
}

export function getTransactions(username: string): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(key(username));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addTransaction(
  username: string,
  record: Omit<TransactionRecord, "id">,
): void {
  const list = getTransactions(username);
  const withId: TransactionRecord = {
    ...record,
    id: `${record.timestamp}-${Math.random().toString(36).slice(2)}`,
    status: record.status ?? "COMPLETED",
  };
  list.unshift(withId);
  localStorage.setItem(key(username), JSON.stringify(list));
}

export function updateTransactionStatus(
  username: string,
  transactionId: string,
  status: TransactionStatus,
): void {
  const list = getTransactions(username);
  const index = list.findIndex((t) => t.id === transactionId);
  if (index === -1) return;
  list[index] = { ...list[index], status };
  localStorage.setItem(key(username), JSON.stringify(list));
}

export function getPendingTransactions(username: string): TransactionRecord[] {
  return getTransactions(username).filter((t) => t.status === "PENDING");
}
