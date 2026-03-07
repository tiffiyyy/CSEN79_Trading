import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StockTable, type StockRow } from "../components/StockTable";
import "./Home.css";

const HERO_FADE_START = 0;
const HERO_FADE_END = 500;
// const LOADING_DURATION_MS = 4000; // unused while loading is disabled

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

export function Home() {
  const [heroOpacity, setHeroOpacity] = useState(1);
  // const [loadingDone, setLoadingDone] = useState(false);
  const loadingDone = true; // loading feature disabled – bazaar shows immediately
  const [symbolSearch, setSymbolSearch] = useState("");

  const filteredEtfs = symbolSearch.trim()
    ? SAMPLE_ETFS.filter((row) =>
        row.symbol.toLowerCase().includes(symbolSearch.trim().toLowerCase())
      )
    : SAMPLE_ETFS;

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;
        const t = Math.min(1, (y - HERO_FADE_START) / (HERO_FADE_END - HERO_FADE_START));
        setHeroOpacity(1 - t);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Loading delay disabled – bazaar table shows immediately
  // useEffect(() => {
  //   const id = setTimeout(() => setLoadingDone(true), LOADING_DURATION_MS);
  //   return () => clearTimeout(id);
  // }, []);

  return (
    <main className="home">
      <section
        className="hero scroll-fade"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${(1 - heroOpacity) * -20}px)`,
        }}
      >
        <div className="glow" aria-hidden />
        <h1 className="hero-title">
          <span className="title-accent">Trade</span> with precision
        </h1>
        <p className="subtitle">for our CSEN 79 course</p>
        <div className="actions">
          <Link to="/login" className="btn btn--primary">
            Start trading
          </Link>
          <Link to="/transaction" className="btn btn--outline">
            View transactions
          </Link>
        </div>
      </section>

      <section className="bazaar">
        <div className="bazaar__bg-text" aria-hidden>
          Bazaar
        </div>
        <div className="bazaar__inner">
          {!loadingDone && (
            <div className="bazaar__loading">
              <p className="bazaar__loading-text">Loading market data…</p>
              <div className="mario-strip">
                <div className="mario-strip__ground" />
                <div className="mario-strip__runner" aria-hidden />
              </div>
            </div>
          )}

          <div className={`bazaar-ui ${loadingDone ? "bazaar-ui--visible" : ""}`}>
            <div className="bazaar-panel bazaar-panel--top">
              <div className="bazaar-panel__title">Bazaar → Trading</div>
              <div className="bazaar-panel__search">
                <input
                  type="text"
                  placeholder="Search by symbol..."
                  value={symbolSearch}
                  onChange={(e) => setSymbolSearch(e.target.value)}
                  className="bazaar-panel__search-input"
                  aria-label="Search by symbol"
                />
              </div>
              <div className="bazaar-panel__content">
                <StockTable rows={filteredEtfs} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
