import "./TrendLine.css";

export interface TrendLineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  showDots?: boolean;
  showFill?: boolean;
  className?: string;
}

export function TrendLine({
  data,
  width = 200,
  height = 80,
  strokeWidth = 2,
  showDots = false,
  showFill = true,
  className = "",
}: TrendLineProps) {
  if (data.length < 2) {
    return (
      <div className={`trendline trendline--empty ${className}`}>
        <span className="trendline__no-data">No price history</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = { top: 8, right: 8, bottom: 8, left: 8 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((value, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y, value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  const trend = data[data.length - 1] - data[0];
  const trendClass = trend >= 0 ? "trendline--up" : "trendline--down";

  return (
    <div className={`trendline ${trendClass} ${className}`}>
      <svg
        className="trendline__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-label={`Price trend: ${trend >= 0 ? "up" : "down"} ${Math.abs(((trend / (data[0] || 1)) * 100)).toFixed(2)}%`}
      >
        <defs>
          <linearGradient id="trendline-gradient-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
          </linearGradient>
          <linearGradient id="trendline-gradient-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </linearGradient>
        </defs>
        {showFill && (
          <path
            className="trendline__fill"
            d={fillD}
            fill={trend >= 0 ? "url(#trendline-gradient-up)" : "url(#trendline-gradient-down)"}
          />
        )}
        <path
          className="trendline__line"
          d={pathD}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots &&
          points.map((p, i) => (
            <circle
              key={i}
              className="trendline__dot"
              cx={p.x}
              cy={p.y}
              r={3}
            />
          ))}
      </svg>
      <div className="trendline__labels">
        <span className="trendline__label trendline__label--high">
          ${max.toFixed(2)}
        </span>
        <span className="trendline__label trendline__label--low">
          ${min.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export function generateMockPriceHistory(
  basePrice: number,
  points: number = 20,
  volatility: number = 0.02
): number[] {
  const history: number[] = [basePrice];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * history[i - 1];
    history.push(Math.max(0.01, history[i - 1] + change));
  }
  return history;
}
