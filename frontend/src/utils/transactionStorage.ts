export interface TransactionRecord {
  id: string;
  action: string;
  orderType: string;
  balanceChange: number;
  amountBoughtSold: number;
  symbol: string;
  company: string;
  timestamp: number;
  status?: "pending" | "executed" | "cancelled" | "unknown";
}

export async function getPendingTransactions(userId: string): Promise<TransactionRecord[]> {
  const transactions = await fetchTransactions(userId);
  return transactions.filter(t => t.status === "pending");
}

export async function updateTransactionStatus(
  userId: string,
  orderId: string,
  newStatus: "cancelled"
): Promise<boolean> {
  if (newStatus !== "cancelled") {
    console.error("Only cancellation is supported");
    return false;
  }
  try {
    const response = await fetch("/api/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: parseInt(userId, 10), orderId: parseInt(orderId, 10) }),
    });
    if (!response.ok) {
      console.error("Failed to cancel transaction:", response.statusText, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    return false;
  }
}

export async function fetchTransactions(userId: string): Promise<TransactionRecord[]> {
  if (!userId) return [];
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: parseInt(userId, 10) }),
    });
    if (!response.ok) {
      console.error("Failed to fetch transactions:", response.statusText);
      return [];
    }
    const data: TransactionRecord[] = await response.json();
    return data.map((t) => ({ ...t, timestamp: t.timestamp * 1000 })).reverse();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
