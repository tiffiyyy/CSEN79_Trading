import React, { useState, useCallback, useEffect } from "react";
import "./InventorySlot.css";

export interface Holding {
  id: string;
  symbol: string;
  company: string;
  shares: number;
  totalValue: number;
  pricePerShare: number;
  change?: number;
  changePercent?: number;
}

interface InventorySlotProps {
  holding?: Holding | null;
  isSpecialSlot?: boolean;
}

export function InventorySlot({ holding, isSpecialSlot }: InventorySlotProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  const closePopup = useCallback(() => setPopupOpen(false), []);

  useEffect(() => {
    if (!popupOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [popupOpen, closePopup]);

  if (holding) {
    return (
      <>
        <button
          type="button"
          className="inventory-slot inventory-slot--filled"
          onClick={() => setPopupOpen(true)}
          aria-label={`View details for ${holding.symbol}`}
        >
          <span className="inventory-slot__default">
            <span className="inventory-slot__symbol">{holding.symbol}</span>
            <span className="inventory-slot__meta">
              ${holding.totalValue.toFixed(0)}
            </span>
            <span
              className={`inventory-slot__change ${
                holding.changePercent != null
                  ? holding.changePercent >= 0
                    ? "inventory-slot__change--up"
                    : "inventory-slot__change--down"
                  : ""
              }`}
            >
              {holding.changePercent != null
                ? `${holding.changePercent >= 0 ? "+" : ""}${holding.changePercent.toFixed(2)}%`
                : "—"}
            </span>
          </span>
          <span className="inventory-slot__hover-overlay">
            {holding.shares} shares
          </span>
        </button>
        {popupOpen && (
          <HoldingDetailModal holding={holding} onClose={closePopup} />
        )}
      </>
    );
  }

  return (
    <div className="inventory-slot">
      {isSpecialSlot && (
        <span className="inventory-slot__star" aria-label="Special" />
      )}
    </div>
  );
}

interface HoldingDetailModalProps {
  holding: Holding;
  onClose: () => void;
}

function HoldingDetailModal({ holding, onClose }: HoldingDetailModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="inventory-popup-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-popup-title"
    >
      <div className="inventory-popup">
        <button
          type="button"
          className="inventory-popup__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="inventory-popup-title" className="inventory-popup__title">
          {holding.company}
        </h2>
        <p className="inventory-popup__symbol">{holding.symbol}</p>

        <div className="inventory-popup__graph">
          <span className="inventory-popup__graph-placeholder">
            Trend graph
          </span>
        </div>

        <dl className="inventory-popup__details">
          <div className="inventory-popup__detail-row">
            <dt>Shares</dt>
            <dd>{holding.shares}</dd>
          </div>
          <div className="inventory-popup__detail-row">
            <dt>Price per share</dt>
            <dd>${holding.pricePerShare.toFixed(2)}</dd>
          </div>
          <div className="inventory-popup__detail-row">
            <dt>Total value</dt>
            <dd>${holding.totalValue.toFixed(2)}</dd>
          </div>
          {holding.change != null && (
            <div className="inventory-popup__detail-row">
              <dt>Change</dt>
              <dd className={holding.change >= 0 ? "positive" : "negative"}>
                {holding.change >= 0 ? "+" : ""}
                {holding.change.toFixed(2)} (
                {holding.changePercent != null
                  ? `${holding.changePercent >= 0 ? "+" : ""}${holding.changePercent.toFixed(2)}%`
                  : "—"}
                )
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
