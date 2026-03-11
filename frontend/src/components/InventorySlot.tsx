import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { TrendLine, generateMockPriceHistory } from "./TrendLine";
import "./InventorySlot.css";

const STAR_BURST_COUNT = 48;
const PLUS_ONE_COUNT = 20;
const BURST_DURATION_MS = 800;
const PLUS_ONE_DURATION_MS = 2200;
const STAR_AMOUNT_MIN = 10;
const STAR_AMOUNT_MAX = 237;

export interface Holding {
  id: string;
  symbol: string;
  company: string;
  shares: number;
  totalValue: number;
  pricePerShare: number;
  change?: number;
  changePercent?: number;
  priceHistory?: number[];
}

interface InventorySlotProps {
  holding?: Holding | null;
  isSpecialSlot?: boolean;
  onStarClick?: (amount: number) => void;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  amount?: number;
}

export function InventorySlot({ holding, isSpecialSlot, onStarClick }: InventorySlotProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [plusOnes, setPlusOnes] = useState<Burst[]>([]);
  const nextBurstIdRef = useRef(0);
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const closePopup = useCallback(() => setPopupOpen(false), []);

  const handleStarClick = useCallback((e: React.MouseEvent) => {
    const amount =
      STAR_AMOUNT_MIN +
      Math.floor(Math.random() * (STAR_AMOUNT_MAX - STAR_AMOUNT_MIN + 1));
    onStarClick?.(amount);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const id = nextBurstIdRef.current++;
    setBursts((prev) => [...prev, { id, x, y }]);
    const t = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
      timeoutsRef.current.delete(id);
    }, BURST_DURATION_MS);
    timeoutsRef.current.set(id, t);
    const plusId = nextBurstIdRef.current++;
    setPlusOnes((prev) => [...prev, { id: plusId, x, y, amount }]);
    const tPlus = setTimeout(() => {
      setPlusOnes((prev) => prev.filter((b) => b.id !== plusId));
    }, PLUS_ONE_DURATION_MS);
    timeoutsRef.current.set(plusId, tPlus);
  }, [onStarClick]);

  useEffect(() => {
    if (!popupOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [popupOpen, closePopup]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

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
    <>
      <button
        type="button"
        className="inventory-slot inventory-slot--star-btn"
        onClick={isSpecialSlot ? handleStarClick : undefined}
        aria-label="Sparkle"
      >
        {isSpecialSlot && (
          <span className="inventory-slot__star" aria-hidden />
        )}
      </button>
      {bursts.map((burst) => (
        <div key={burst.id} className="star-burst-container" aria-hidden>
          {Array.from({ length: STAR_BURST_COUNT }, (_, i) => {
            const angle = (i / STAR_BURST_COUNT) * 2 * Math.PI + Math.random() * 0.5;
            const distance = 50 + Math.random() * 60;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            return (
              <span
                key={i}
                className="star-burst-particle"
                style={
                  {
                    left: burst.x,
                    top: burst.y,
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                  } as React.CSSProperties & { "--dx": string; "--dy": string }
                }
              />
            );
          })}
        </div>
      ))}
      {plusOnes.map((plus) => (
        <div key={plus.id} className="star-burst-container star-plus-one-container" aria-hidden>
          {Array.from({ length: PLUS_ONE_COUNT }, (_, i) => {
            const angle = Math.random() * 2 * Math.PI;
            const distance = 40 + Math.random() * 80;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const label = plus.amount != null ? `+$${plus.amount}` : "+$1";
            return (
              <span
                key={i}
                className="star-burst-plus-one"
                style={
                  {
                    left: plus.x,
                    top: plus.y,
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                  } as React.CSSProperties & { "--dx": string; "--dy": string }
                }
              >
                {label}
              </span>
            );
          })}
        </div>
      ))}
    </>
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

  const priceData = useMemo(() => {
    if (holding.priceHistory && holding.priceHistory.length >= 2) {
      return holding.priceHistory;
    }
    return generateMockPriceHistory(holding.pricePerShare, 20, 0.03);
  }, [holding.priceHistory, holding.pricePerShare]);

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
          <TrendLine data={priceData} height={120} showFill />
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
