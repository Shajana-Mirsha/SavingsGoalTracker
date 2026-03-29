import { useNavigate } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";
import logo from "../assets/logo.svg";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            color: "white", textAlign: "center", padding: "40px",
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <img src={logo} alt="Vault Goal" style={{ height: "52px", marginBottom: "40px", filter: "brightness(10)" }} />

            {/* 404 Number */}
            <div style={{
                fontSize: "120px", fontWeight: "900", letterSpacing: "-6px",
                background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1, marginBottom: "16px"
            }}>404</div>

            <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: "16px" }} />

            <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 10px", color: "white" }}>
                Page Not Found
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", maxWidth: "380px", lineHeight: 1.7, marginBottom: "36px" }}>
                The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            <button
                onClick={() => navigate("/dashboard")}
                style={{
                    background: "#2563eb", color: "white", border: "none",
                    padding: "14px 32px", borderRadius: "14px", fontWeight: "800",
                    fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center",
                    gap: "10px", transition: "transform 0.15s ease, box-shadow 0.15s ease"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(37,99,235,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
                <Home size={18} /> Go to Dashboard
            </button>
        </div>
    );
}
