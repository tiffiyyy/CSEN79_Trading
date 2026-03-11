import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername } from "../components/ProtectedRoute";
import { StockTable, type StockRow } from "../components/StockTable";
import { InventorySlot, type Holding } from "../components/InventorySlot";
import { placeBuyOrder, placeSellOrder, getBalance, getUserData, updateBalance } from "../utils/apiCalls";
import "./Selection.css";

const SAMPLE_ETFS: StockRow[] = [
  { symbol: "SPY", company: "SPDR S&P 500 ETF Trust", price: 450.25, change: 2.15, changePercent: 0.48 },
  { symbol: "QQQ", company: "Invesco QQQ Trust", price: 385.5, change: -1.2, changePercent: -0.31 },
  { symbol: "IWM", company: "iShares Russell 2000 ETF", price: 195.8, change: 0.85, changePercent: 0.44 },
  { symbol: "VTI", company: "Vanguard Total Stock Market ETF", price: 235.0, change: 1.5, changePercent: 0.64 },
  { symbol: "VOO", company: "Vanguard S&P 500 ETF", price: 412.0, change: 1.8, changePercent: 0.44 },
  { symbol: "EFA", company: "iShares MSCI EAFE ETF", price: 68.5, change: -0.3, changePercent: -0.44 },
  { symbol: "EEM", company: "iShares MSCI Emerging Markets ETF", price: 39.2, change: 0.5, changePercent: 1.29 },
  { symbol: "GLD", company: "SPDR Gold Shares", price: 185.4, change: 2.1, changePercent: 1.15 },
  { symbol: "BND", company: "Vanguard Total Bond Market ETF", price: 72.8, change: 0.1, changePercent: 0.14 },
  { symbol: "ARKK", company: "ARK Innovation ETF", price: 42.6, change: -0.8, changePercent: -1.84 },
  { symbol: "XLF", company: "Financial Select Sector SPDR", price: 41.2, change: 0.35, changePercent: 0.86 },
];

export function Selection() {
  const navigate = useNavigate();
  const currentUsername = getCurrentUsername() ?? "-";
  const action = ["-", "Buy", "Sell"];
  const order = ["-", "Limit Order", "Market Order"];
  const [selectedAction, setSelectedAction] = useState("-");
  const [selectedOrder, setSelectedOrder] = useState("-");
  const [numShares, setNumShares] = useState("");
  const [selectedRow, setSelectedRow] = useState<StockRow | null>(null);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [accountBalance, setAccountBalance] = useState(0);
  const [limitPrice, setLimitPrice] = useState("");

  const fetchData = async () => {
    try {
      const [balanceResponse, holdingsResponse] = await Promise.all([
        getBalance(),
        getUserData(),
      ]);
      setAccountBalance(balanceResponse.balance);
      setHoldings(holdingsResponse);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const q = symbolSearch.trim().toLowerCase();
  const filteredEtfs = q
    ? SAMPLE_ETFS.filter(
        (row) =>
          row.symbol.toLowerCase().startsWith(q) ||
          row.company.toLowerCase().startsWith(q)
      )
    : SAMPLE_ETFS;

  const numSharesVal = Number(numShares) || 0;
  const pricePerShare = selectedRow?.price ?? 0;
  const effectivePrice =
    selectedOrder === "Limit Order" ? Number(limitPrice) || 0 : pricePerShare;
  const orderValue = numSharesVal * effectivePrice;

  const inventoryRows = Math.max(4, Math.ceil(Math.max(holdings.length, 36) / 9));
  const totalSlots = inventoryRows * 9;

  //const orderTypeLabel = selectedOrder === "-" ? "Market Order" : selectedOrder;

  const handleTransactionSubmit = async () => {
    if (selectedAction === "-" || !selectedRow) return;
    
    const symbol = selectedRow.symbol;
    //const company = selectedRow.company;
    const orderType = selectedOrder === "Limit Order" ? "limit" : "market";
    const price = orderType === 'limit' ? Number(limitPrice) : undefined;
    
    try {
      if (selectedAction === "Buy") {
        await placeBuyOrder(symbol, orderType, numSharesVal, price);
      } else if (selectedAction === "Sell") {
        await placeSellOrder(symbol, orderType, numSharesVal, price);
      }
      await fetchData();
      navigate("/transaction");
    } catch (error) {
      console.error(`${selectedAction} order failed:`, error);
      alert(`Failed to ${selectedAction.toLowerCase()} order. Please try again.`);
    }
  };

  const handleStarClick = async (amount: number) => {
    try {
      const response = await updateBalance(amount);
      setAccountBalance(response.balance);
    } catch (error) {
      console.error("Failed to update balance:", error);
      alert("Failed to update balance. Please try again.");
    }
  };

  return (
    <div className="page selection-page">
      <h2 className="page__title">Buy Stocks</h2>
      <p className="selection-balance">Balance: ${accountBalance}</p>

      <div className="selection-row selection-row--bazaar">
        <div className="selection-bazaar-panel">
          <div className="selection-bazaar-panel__title">Bazaar → Trading</div>
          <div className="selection-bazaar-panel__search">
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={symbolSearch}
              onChange={(e) => setSymbolSearch(e.target.value)}
              className="selection-bazaar-panel__search-input"
              aria-label="Search by symbol or name"
            />
          </div>
          <div className="selection-bazaar-panel__content">
            <StockTable
              rows={filteredEtfs}
              selectedSymbol={selectedRow?.symbol ?? null}
              onSelectRow={(row) =>
                setSelectedRow((prev) => (prev?.symbol === row.symbol ? null : row))
              }
            />
          </div>
        </div>
      </div>

      <div className="selection-row selection-row--form">
        <div className="account-box">
            <div className="selections">
              <p>ACCOUNT</p>
              <select value={currentUsername} onChange={() => {}} aria-label="Current account">
                <option value={currentUsername}>{currentUsername}</option>
              </select>
            </div>
          </div>

          <div className="selections-box">
            <div className="selections">
              <p>ACTION</p>
              <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                {action.map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>
            <div className="selections">
              <p>NUM SHARES</p>
              <input
                type="number"
                placeholder="0"
                value={numShares}
                min={1}
                onChange={(e) => setNumShares(e.target.value)}
                className="numShares"
              />
            </div>
            {selectedOrder === "Limit Order" && (
              <div className="selections">
                <p>PRICE</p>
                <input
                  type="number"
                  placeholder="0"
                  value={limitPrice}
                  min={1}
                  step={1}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="numShares"
                  aria-label="Limit price"
                />
              </div>
            )}
            <div className="selections">
              <p>ORDER TYPE</p>
              <select
                value={selectedOrder}
                onChange={(e) => {
                  const next = e.target.value;
                  setSelectedOrder(next);
                  if (next !== "Limit Order") setLimitPrice("");
                }}
              >
                {order.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="est-value">
            <h2>Estimated Order Value</h2>
            <p className="est-value__display">
              {selectedRow && numSharesVal > 0
                ? `$${orderValue.toFixed(2)}`
                : "Value Here"}
            </p>
            <p className="est-value__hint">
              {selectedRow ? `${numSharesVal} × $${effectivePrice.toFixed(2)}` : "Select an ETF and enter num shares"}
            </p>
            <button 
              disabled={selectedAction === "-" || !selectedRow || numSharesVal <= 0} 
              onClick={handleTransactionSubmit}
            >
              {selectedAction === "-" ? "Select an Action" : selectedAction}
            </button>
          </div>
      </div>

      <div className="selection-inventory-wrap">
        <div className="selection-inventory-panel">
          <div className="selection-inventory-panel__title">Inventory</div>
          <div
            className="selection-inventory-panel__grid"
            style={{ gridTemplateRows: `repeat(${inventoryRows}, 1fr)` }}
          >
            {Array.from({ length: totalSlots }, (_, i) => (
              <InventorySlot
                key={holdings[i]?.id ?? `empty-${i}`}
                holding={holdings[i] ?? null}
                isSpecialSlot={i === totalSlots - 1}
                onStarClick={i === totalSlots - 1 ? handleStarClick : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
