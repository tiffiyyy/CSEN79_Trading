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
  const [cracksVisible, setCracksVisible] = useState(false);
  const loadingDone = true;
  const [symbolSearch, setSymbolSearch] = useState("");

  const handleHeroClick = (e: React.MouseEvent) => {
    if (!cracksVisible && e.target === e.currentTarget) setCracksVisible(true);
  };

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
        onClick={handleHeroClick}
      >
        <div className="hero-video-wrap" aria-hidden>
          <video
            className="hero-video"
            src="/stocks.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="hero-video-dim" />
        </div>
        {cracksVisible && (
          <div className="hero-crack-overlay" aria-hidden>
            <svg className="hero-crack-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="crack-glow">
                  <feGaussianBlur stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Central impact */}
              <circle cx="200" cy="200" r="4" fill="#0a0a0b" className="hero-crack-impact" />
              {/* Radial cracks from center */}
              {[
                [200, 200, 200, 40], [200, 200, 240, 80], [200, 200, 160, 60], [200, 200, 200, 360],
                [200, 200, 80, 180], [200, 200, 320, 200], [200, 200, 60, 120], [200, 200, 340, 260],
                [200, 200, 100, 240], [200, 200, 300, 100], [200, 200, 220, 140], [200, 200, 180, 280],
                [200, 200, 140, 50], [200, 200, 260, 330], [200, 200, 120, 320], [200, 200, 280, 70],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="hero-crack-line" style={{ animationDelay: `${i * 0.04}s` }} />
              ))}
              {/* Secondary branching cracks */}
              {[
                [120, 120, 160, 100], [280, 120, 240, 100], [100, 280, 140, 260], [300, 280, 260, 260],
                [180, 80, 220, 60], [80, 200, 120, 190], [320, 200, 280, 210], [200, 320, 190, 280],
                [140, 140, 180, 160], [260, 140, 220, 160], [160, 260, 200, 240], [240, 260, 200, 250],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={`b-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="hero-crack-line hero-crack-line--branch" style={{ animationDelay: `${0.3 + i * 0.05}s` }} />
              ))}
            </svg>
          </div>
        )}
        <div className="glow" aria-hidden />
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-accent">Trade</span> with precision
          </h1>
          <p className="subtitle">with our CSEN 79 project</p>
          <div className="actions">
            <Link to="/login" className="btn btn--primary">
              Start trading
            </Link>
            <Link to="/transaction" className="btn btn--outline">
              View transactions
            </Link>
          </div>
        </div>
      </section>

      <section className="bazaar">
        <div className="bazaar__bg-text" aria-hidden>
          The Bazaar
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
