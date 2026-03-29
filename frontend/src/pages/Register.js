import { useState, useEffect, useRef, useCallback } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import logo from "../assets/logo.svg";

// Natural water ripple canvas hook (same as Login)
function useRippleCanvas() {
  const canvasRef = useRef(null);
  const ripples = useRef([]);
  const animRef = useRef(null);

  const addRipple = useCallback((x, y) => {
    [0, 80, 180].forEach((delay, i) => {
      setTimeout(() => {
        ripples.current.push({
          x, y, r: 2,
          maxR: 90 + i * 30,
          alpha: 0.55 - i * 0.12,
          speed: 2.8 - i * 0.4,
          lineW: 1.8 - i * 0.3
        });
        if (ripples.current.length > 60) ripples.current.shift();
      }, delay);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.current = ripples.current.filter(r => r.alpha > 0.005 && r.r < r.maxR);
      ripples.current.forEach(r => {
        const progress = r.r / r.maxR;
        r.r += r.speed * (1 - progress * 0.6);
        r.alpha *= 0.96;
        const rx = r.r;
        const ry = r.r * 0.38;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148,163,255,${r.alpha})`;
        ctx.lineWidth = r.lineW;
        ctx.stroke();
        if (r.lineW > 1.5) {
          const grd = ctx.createRadialGradient(r.x, r.y - ry * 0.5, 0, r.x, r.y, rx);
          grd.addColorStop(0, `rgba(148,163,255,0)`);
          grd.addColorStop(0.7, `rgba(148,163,255,${r.alpha * 0.06})`);
          grd.addColorStop(1, `rgba(148,163,255,0)`);
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, rx, ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return { canvasRef, addRipple };
}

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { canvasRef, addRipple } = useRippleCanvas();
  const lastMove = useRef(0);

  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    if (now - lastMove.current < 60) return;
    lastMove.current = now;
    addRipple(e.clientX, e.clientY);
  }, [addRipple]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser(formData);
      navigate("/", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    paddingLeft: "44px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f1f5f9",
    borderRadius: "14px"
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Water Ripple Canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 0, mixBlendMode: "screen" }} />

      {/* Background ambient orbs */}
      <div className="login-blob-1" style={{
        position: "absolute", top: "20%", left: "15%", width: "400px", height: "400px",
        background: "rgba(79, 70, 229, 0.25)", filter: "blur(120px)", borderRadius: "50%", zIndex: 0
      }} />
      <div className="login-blob-2" style={{
        position: "absolute", bottom: "15%", right: "15%", width: "450px", height: "450px",
        background: "rgba(16, 185, 129, 0.15)", filter: "blur(130px)", borderRadius: "50%", zIndex: 0
      }} />

      {/* Glassmorphic Card */}
      <div className="login-card" style={{
        position: "relative", zIndex: 1,
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRadius: "28px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        padding: "48px 44px",
        width: "100%", maxWidth: "440px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.9)",
            padding: "14px 22px", borderRadius: "20px",
            marginBottom: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            <img src={logo} alt="Vault Goal" style={{ height: "44px" }} />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: "900", color: "#f1f5f9", letterSpacing: "-0.5px" }}>
            Create Account
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
            Join and start saving smarter today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: "grid", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <User size={17} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <input className="pro-input" style={inputStyle} placeholder="Full Name" required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div style={{ position: "relative" }}>
            <Mail size={17} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <input className="pro-input" style={inputStyle} type="email" placeholder="Email Address" required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={17} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <input className="pro-input" style={inputStyle} type="password" placeholder="Create Password (min 8 chars)" required minLength={8}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          {error && (
            <div style={{ background: "rgba(153,27,27,0.3)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: "12px", padding: "12px 16px", color: "#fca5a5", fontSize: "13px", fontWeight: "700", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            color: "white", padding: "15px", borderRadius: "14px", border: "none",
            fontWeight: "800", fontSize: "15px", cursor: "pointer",
            boxShadow: "0 8px 20px rgba(79,70,229,0.4)",
            marginTop: "4px", opacity: loading ? 0.75 : 1,
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 28px rgba(79,70,229,0.5)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.4)"; }}
          >
            {loading ? "Creating Account..." : <><ArrowRight size={17} /> Create Account</>}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: "22px 0", display: "flex", alignItems: "center", gap: "12px" }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>OR</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
          style={{
            width: "100%", padding: "14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "12px", cursor: "pointer", fontWeight: "700", fontSize: "14px", color: "#e2e8f0",
            transition: "all 0.2s ease"
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="20" alt="G" />
          Continue with Google
        </button>

        <p style={{ marginTop: "22px", textAlign: "center", color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#818cf8", fontWeight: "800", textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}