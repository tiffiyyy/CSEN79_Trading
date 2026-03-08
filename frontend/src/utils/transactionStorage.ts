export interface TransactionRecord {
  id: string;
  action: string;
  orderType: string;
  balanceChange: number;
  amountBoughtSold: number;
  symbol: string;
  company: string;
  timestamp: number;
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

export function addTransaction(username: string, record: Omit<TransactionRecord, "id">): void {
  const list = getTransactions(username);
  const withId: TransactionRecord = {
    ...record,
    id: `${record.timestamp}-${Math.random().toString(36).slice(2)}`,
  };
  list.unshift(withId);
  localStorage.setItem(key(username), JSON.stringify(list));
}
