// Progress.jsx — presentational phase progress for async LLM steps.
// Stateless: shows named phases (done/active/pending) + an indeterminate
// CSS-animated bar so the UI never looks frozen during unknown-duration calls.
// Plain JSX, inline styles + one injected <style> for keyframes. No packages.
import { useState, useEffect } from "react";

// Reassurance copy — rotates every 10s so a long call never reads as frozen.
const REASSURE = [
  "still working…",
  "hang on, we're close",
  "wrangling the details…",
  "almost there — hang tight",
  "still going — long input takes a sec",
];

// Animated inline spinner used for the active label.
export function Dots({ c }) {
  return (
    <span
      className="mono"
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "1.1em",
        color: c.beam,
        animation: "klear-dots 1.2s steps(4, end) infinite",
      }}
    >
      <style>{`
        @keyframes klear-dots {
          0%   { content: ""; }
          25%  { content: "."; }
          50%  { content: ".."; }
          75%  { content: "..."; }
          100% { content: ""; }
        }
      `}</style>
      <span style={{ animation: "klear-dots-text 1.2s steps(4,end) infinite" }}>
        {"⠋"}
      </span>
    </span>
  );
}

export function PhaseProgress({ c, steps, activeIndex }) {
  const list = Array.isArray(steps) ? steps : [];
  // Live elapsed counter — proof the call is still running, not frozen.
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        background: c.panel,
        border: `1px solid ${c.line}`,
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <style>{`
        @keyframes klear-slide {
          from { left: -40%; }
          to   { left: 100%; }
        }
        @keyframes klear-pulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes klear-spin {
          0%   { content: "\\2807"; }
          100% { content: "\\280F"; }
        }
        @media (prefers-reduced-motion: reduce) {
          .klear-bar-seg { animation: none !important; left: 0 !important; width: 35% !important; }
          .klear-active  { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* Step labels */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 16px",
          marginBottom: 10,
        }}
      >
        {list.map((label, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;

          const base = {
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          };

          if (isDone) {
            return (
              <span key={i} className="mono" style={{ ...base, color: c.signal }}>
                {"✓ "}
                {label}
              </span>
            );
          }
          if (isActive) {
            return (
              <span
                key={i}
                className="mono klear-active"
                style={{
                  ...base,
                  color: c.beam,
                  animation: "klear-pulse 1.4s ease-in-out infinite",
                }}
              >
                <Dots c={c} />
                {label}
              </span>
            );
          }
          // pending
          return (
            <span
              key={i}
              className="mono"
              style={{ ...base, color: c.mute, opacity: 0.5 }}
            >
              {label}
            </span>
          );
        })}
      </div>

      {/* Indeterminate progress bar */}
      <div
        role="progressbar"
        aria-label="Working"
        style={{
          position: "relative",
          height: 4,
          background: c.line,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          className="klear-bar-seg"
          style={{
            position: "absolute",
            top: 0,
            left: "-40%",
            height: "100%",
            width: "40%",
            background: c.beam,
            borderRadius: 999,
            animation: "klear-slide 1.6s ease-in-out infinite",
          }}
        />
      </div>
      <div className="mono" style={{ fontSize: 10, color: c.mute, marginTop: 6, textAlign: "right", letterSpacing: 1 }}>
        {secs}s · {REASSURE[Math.min(Math.floor(secs / 10), REASSURE.length - 1)]}
      </div>
    </div>
  );
}
