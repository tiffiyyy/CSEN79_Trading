//import React from "react";
import "./StockTable.css";

export interface StockRow {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  [key: string]: string | number | undefined;
}

interface StockTableProps {
  rows?: StockRow[];
  columns?: { key: keyof StockRow; label: string }[];
  selectedSymbol?: string | null;
  onSelectRow?: (row: StockRow) => void;
}

const DEFAULT_COLUMNS: { key: keyof StockRow; label: string }[] = [
  { key: "symbol", label: "Symbol" },
  { key: "company", label: "Company" },
  { key: "price", label: "Price" },
  { key: "change", label: "Change" },
  { key: "changePercent", label: "%" },
];

const TEMP_ROW: StockRow = {
  symbol: "SPY",
  company: "SPDR S&P 500 ETF Trust",
  price: 450.25,
  change: 2.15,
  changePercent: 0.48,
  volume: 52_000_000,
};

export function StockTable({
  rows = [TEMP_ROW],
  columns = DEFAULT_COLUMNS,
  selectedSymbol = null,
  onSelectRow,
}: StockTableProps) {
  return (
    <div className="stock-table-wrap">
      <table className="stock-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="stock-table__th">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.symbol ?? i}
              className={`stock-table__row ${row.symbol === selectedSymbol ? "stock-table__row--selected" : ""}`}
              onClick={() => onSelectRow?.(row)}
              role={onSelectRow ? "button" : undefined}
              tabIndex={onSelectRow ? 0 : undefined}
            >
              {columns.map((col) => {
                const val = row[col.key];
                const isChange = col.key === "change" || col.key === "changePercent";
                const isPrice = col.key === "price";
                const num = typeof val === "number" ? val : undefined;
                return (
                  <td key={String(col.key)} className="stock-table__cell">
                    {isPrice && num !== undefined
                      ? num.toFixed(2)
                      : isChange && num !== undefined
                        ? (
                            <span className={num >= 0 ? "stock-table__up" : "stock-table__down"}>
                              {col.key === "changePercent"
                                ? `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
                                : num.toFixed(2)}
                            </span>
                          )
                        : String(val ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
