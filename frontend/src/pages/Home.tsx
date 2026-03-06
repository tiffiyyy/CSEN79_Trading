import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const HERO_FADE_START = 0;
const HERO_FADE_END = 500;

export function Home() {
  const [heroOpacity, setHeroOpacity] = useState(1);

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
        <p className="subtitle">
          Real-time markets. Transparent execution. Built for serious traders.
        </p>
        <div className="actions">
          <Link to="/selection" className="btn btn--primary">
            Start trading
          </Link>
          <Link to="/transaction" className="btn btn--outline">
            View transactions
          </Link>
        </div>
      </section>
    </main>
  );
}
