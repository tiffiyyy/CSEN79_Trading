function callApi(endpoint: string, method: string, body?: Record<string, unknown>): Promise<unknown> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return fetch(endpoint, options).then((response) => {
    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }
    return response.json();
  });
}

const USER_ID_KEY = "trading_user_id";

export function getUserId(): number {
  const stored = localStorage.getItem(USER_ID_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function setUserId(id: number): void {
  localStorage.setItem(USER_ID_KEY, id.toString());
}

export function createAccount(username: string): Promise<unknown> {
  return callApi("/api/createAccount", "POST", { name: username });
}

export function placeBuyOrder(symbol: string, orderType: string, shares: number): Promise<unknown> {
  const userId = getUserId();
  return callApi("/api/buy", "POST", { symbol, orderType, shares, userId });
}

export function placeSellOrder(symbol: string, orderType: string, shares: number): Promise<unknown> {
  const userId = getUserId();
  return callApi("/api/sell", "POST", { symbol, orderType, shares, userId });
}

export function cancelOrder(symbol: string, orderType: string = "", shares: number = 0): Promise<unknown> {
  const userId = getUserId();
  return callApi("/api/cancel", "POST", { symbol, orderType, shares, userId });
}

export function getBalance(): Promise<{ balance: number }> {
  const userId = getUserId();
  return callApi("/api/balance", "POST", { userId }) as Promise<{ balance: number }>;
}
export async function signInAccount(name: string) {
  const response = await fetch("/api/signIn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return response.json();
}
