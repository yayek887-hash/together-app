import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PILLARS = [
  { emoji: "🔥", label: "Inspire",  sub: "Content that lights you up",   color: "#dc2626", bg: "#fff5f5" },
  { emoji: "🤝", label: "Connect",  sub: "Find people who get you",       color: "#5b3cdd", bg: "#f0ebff" },
  { emoji: "📍", label: "Meet",     sub: "Real plans, real friendships",  color: "#059669", bg: "#ecfdf5" },
  { emoji: "💜", label: "Support",  sub: "Safe spaces for anything",      color: "#7c3aed", bg: "#f5f3ff" },
];

const AVATAR_COLORS = ["#5b3cdd", "#e05a00", "#059669", "#db2777"];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/home");
  }, [loading, user, navigate]);

  return (
    <div
      className="anim-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0 0 0",
        background: "#f6f2ed",
        backgroundImage:
          "radial-gradient(ellipse 600px 400px at 80% 10%, rgba(91,60,221,0.07) 0%, transparent 65%), " +
          "radial-gradient(ellipse 400px 400px at 10% 85%, rgba(200,80,200,0.04) 0%, transparent 65%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ── */}
      <div style={{ padding: "48px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "var(--color-text)" }}>
          together
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "var(--color-primary)",
          background: "var(--color-primary-fixed)", borderRadius: 999,
          padding: "5px 12px", letterSpacing: "0.04em",
        }}>
          BETA
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ padding: "44px 28px 32px", flex: 1 }}>
        {/* Avatar stack */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ display: "flex" }}>
            {AVATAR_COLORS.map((bg, i) => (
              <div
                key={i}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: bg,
                  marginLeft: i === 0 ? 0 : -10,
                  border: "2.5px solid #f6f2ed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#fff", fontWeight: 700,
                }}
              >
                {["M", "T", "A", "R"][i]}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500 }}>
            Teens already growing here
          </span>
        </div>

        {/* Big headline */}
        <h1 style={{
          margin: "0 0 16px",
          fontSize: 42, fontWeight: 900,
          lineHeight: 1.08, letterSpacing: "-0.04em",
          color: "var(--color-text)",
        }}>
          Grow with<br />
          people who<br />
          <span style={{ color: "var(--color-primary)" }}>get you.</span>
        </h1>

        <p style={{
          margin: "0 0 36px",
          fontSize: 16, lineHeight: 1.65,
          color: "var(--color-text-soft)",
          maxWidth: 300,
        }}>
          Real connections, daily inspiration, and safe spaces — built for teens.
        </p>

        {/* 4 pillars grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
          {PILLARS.map(p => (
            <div
              key={p.label}
              style={{
                background: "#fff",
                borderRadius: 18, padding: "14px 14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${p.color}`,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{p.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em", marginBottom: 2 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-soft)", lineHeight: 1.4 }}>
                {p.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA section ── */}
      <div style={{
        background: "#1a1523",
        borderRadius: "28px 28px 0 0",
        padding: "32px 28px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative glow */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(91,60,221,0.2)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: -20, bottom: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(200,80,200,0.08)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Ready to find your people?
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24, lineHeight: 1.5 }}>
            Free. Safe. Just for teens.
          </div>

          <button
            onClick={signInWithGoogle}
            style={{
              width: "100%", height: 54,
              background: "#fff", color: "var(--color-text)",
              border: "none", borderRadius: 16,
              fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "Rubik, sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
              marginBottom: 16,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
            By continuing you agree to be kind and report anything that doesn't feel right.
          </p>

          {/* Trust row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
            {[
              { icon: "verified_user", label: "Safe" },
              { icon: "lock",          label: "Private" },
              { icon: "favorite",      label: "Supportive" },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span className="material-symbols-outlined" style={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
