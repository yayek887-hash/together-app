import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

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
        justifyContent: "space-between",
        padding: "60px 28px 44px",
        background: "var(--color-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="blob"
        style={{
          width: 340,
          height: 340,
          background: "var(--color-primary-fixed)",
          top: -80,
          left: -80,
        }}
      />
      <div
        className="blob"
        style={{
          width: 280,
          height: 280,
          background: "#ffdcc3",
          bottom: 120,
          right: -80,
        }}
      />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-button)",
          }}
        >
          <span className="material-symbols-outlined ms-filled" style={{ color: "#fff", fontSize: 22 }}>
            group
          </span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--color-primary)", letterSpacing: 0.3 }}>
          Together
        </span>
      </div>

      {/* Illustration area */}
      <div style={{ textAlign: "center" }}>
        {/* Avatar stack */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          {["var(--color-primary)", "var(--color-tertiary-container)", "#ffb77d"].map((bg, i) => (
            <div
              key={i}
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: bg,
                marginLeft: i === 0 ? 0 : -20,
                border: "3px solid var(--color-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="material-symbols-outlined ms-filled" style={{ color: "#fff", fontSize: 26 }}>
                {["person", "favorite", "star"][i]}
              </span>
            </div>
          ))}
        </div>

        <h1 className="t-h1" style={{ marginBottom: 12, color: "var(--color-text)" }}>
          You are not alone.
        </h1>
        <p className="t-body-lg" style={{ color: "var(--color-text-soft)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
          A safe place to connect with kids who understand what you're going through.
        </p>
      </div>

      {/* Actions */}
      <div>
        <button className="btn btn-primary" onClick={signInWithGoogle} style={{ marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span>
          Continue with Google
        </button>

        <p
          className="t-label-sm"
          style={{ color: "var(--color-text-soft)", textAlign: "center", marginTop: 4, lineHeight: 1.6 }}
        >
          By continuing you agree to be kind and report anything that doesn't feel right.
        </p>

        {/* Trust indicators */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            marginTop: 28,
            opacity: 0.65,
          }}
        >
          {[
            { icon: "verified_user", label: "Secure" },
            { icon: "group",         label: "Community" },
            { icon: "volunteer_activism", label: "Supportive" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", fontSize: 22 }}>
                {icon}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
