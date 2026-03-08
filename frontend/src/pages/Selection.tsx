import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUsername } from "../components/ProtectedRoute";
import { StockTable, type StockRow } from "../components/StockTable";
import { InventorySlot, type Holding } from "../components/InventorySlot";
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

const DEMO_HOLDINGS: Holding[] = [
  { id: "1", symbol: "SPY", company: "SPDR S&P 500 ETF Trust", shares: 10, totalValue: 4502.5, pricePerShare: 450.25, change: 2.15, changePercent: 0.48 },
  { id: "2", symbol: "QQQ", company: "Invesco QQQ Trust", shares: 5, totalValue: 1927.5, pricePerShare: 385.5, change: -1.2, changePercent: -0.31 },
  { id: "3", symbol: "VTI", company: "Vanguard Total Stock Market ETF", shares: 20, totalValue: 4700, pricePerShare: 235.0, change: 1.5, changePercent: 0.64 },
];

export function Selection() {
  const navigate = useNavigate();
  const currentUsername = getCurrentUsername() ?? "-";
  const action = ["-", "Buy", "Sell", "Cancel"];
  const order = ["-", "Limit Order", "Market Order", "Cancel Order"];
  const [selectedAction, setSelectedAction] = useState("-");
  const [selectedOrder, setSelectedOrder] = useState("-");
  const [numShares, setNumShares] = useState("");
  const [selectedRow, setSelectedRow] = useState<StockRow | null>(null);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [holdings, setHoldings] = useState<Holding[]>(DEMO_HOLDINGS);
  const [accountBalance, setAccountBalance] = useState(0);

  const filteredEtfs = symbolSearch.trim()
    ? SAMPLE_ETFS.filter((row) =>
        row.symbol.toLowerCase().includes(symbolSearch.trim().toLowerCase())
      )
    : SAMPLE_ETFS;

  const numSharesVal = Number(numShares) || 0;
  const pricePerShare = selectedRow?.price ?? 0;
  const orderValue = numSharesVal * pricePerShare;

  const inventoryRows = Math.max(4, Math.ceil(Math.max(holdings.length, 36) / 9));
  const totalSlots = inventoryRows * 9;

  const handleBuyClick = () => {
    if (selectedAction !== "Buy" || !selectedRow || numSharesVal <= 0) return;
    const newHolding: Holding = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      symbol: selectedRow.symbol,
      company: selectedRow.company,
      shares: numSharesVal,
      totalValue: orderValue,
      pricePerShare: selectedRow.price,
      change: selectedRow.change,
      changePercent: selectedRow.changePercent,
    };
    setHoldings((prev) => [...prev, newHolding]);
    navigate("/transaction");
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
              placeholder="Search by symbol..."
              value={symbolSearch}
              onChange={(e) => setSymbolSearch(e.target.value)}
              className="selection-bazaar-panel__search-input"
              aria-label="Search by symbol"
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
            <div className="selections">
              <p>ORDER TYPE</p>
              <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}>
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
              {selectedRow ? `${numSharesVal} × $${pricePerShare.toFixed(2)}` : "Select an ETF and enter num shares"}
            </p>
            {selectedAction === "Buy" && selectedRow && numSharesVal > 0 ? (
              <button onClick={handleBuyClick}>Buy</button>
            ) : (
              <Link to="/transaction">
                <button disabled={selectedAction === "-"}>
                  {selectedAction === "-" ? "Select an Action" : selectedAction}
                </button>
              </Link>
            )}
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
                onStarClick={i === totalSlots - 1 ? () => setAccountBalance((b) => b + 1) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
