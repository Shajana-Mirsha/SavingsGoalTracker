import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "../assets/logo.svg";

const API = `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/bank`;

export default function BankPinGate() {
    const [pin, setPin] = useState(["", "", "", ""]);
    const [mode, setMode] = useState("verify");   // "verify" | "set" | "confirm"
    const [firstPin, setFirstPin] = useState(null);
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [initializing, setInit] = useState(true); // loading while checking hasPin
    const [shake, setShake] = useState(false);
    const inputs = useRef([]);
    const navigate = useNavigate();
    const token = () => localStorage.getItem("token");

    // Check if PIN is already set for this account
    useEffect(() => {
        const checkPin = async () => {
            try {
                const t = localStorage.getItem("token");
                if (!t) { navigate("/"); return; }
                const res = await axios.get(`${API}/account`, {
                    headers: { Authorization: `Bearer ${t}` }
                });
                // hasPin false or missing → user needs to set a PIN first
                if (!res.data.hasPin) setMode("set");
            } catch (err) {
                if (err.response?.status === 401) {
                    // Not logged in
                    navigate("/");
                } else if (err.response?.status === 404) {
                    // No bank account yet → go setup
                    navigate("/bank");
                } else {
                    // Any other error (network, 500) — don't redirect, just show error
                    setError("Could not reach server. Please try again.");
                }
            } finally {
                setInit(false);
            }
        };
        checkPin();
    }, []);

    const focusNext = (idx) => {
        if (idx < 3) inputs.current[idx + 1]?.focus();
    };

    const handleKey = (idx, e) => {
        if (e.key === "Backspace" && !pin[idx] && idx > 0) {
            inputs.current[idx - 1]?.focus();
        }
    };

    const handleInput = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...pin];
        next[idx] = val;
        setPin(next);
        setError("");
        if (val) focusNext(idx);
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSubmit = async () => {
        const pinStr = pin.join("");
        if (pinStr.length < 4) { setError("Enter all 4 digits"); return; }

        if (mode === "set") {
            setFirstPin(pinStr);
            setPin(["", "", "", ""]);
            setMode("confirm");
            setTimeout(() => inputs.current[0]?.focus(), 100);
            return;
        }

        if (mode === "confirm") {
            if (pinStr !== firstPin) {
                setError("PINs don't match. Try again.");
                triggerShake();
                setPin(["", "", "", ""]);
                setTimeout(() => inputs.current[0]?.focus(), 100);
                return;
            }
            setLoading(true);
            try {
                await axios.post(`${API}/set-pin`, { pin: firstPin }, {
                    headers: { Authorization: `Bearer ${token()}` }
                });
                // Now verify immediately with the new PIN
                const res = await axios.post(`${API}/verify-pin`, { pin: firstPin }, {
                    headers: { Authorization: `Bearer ${token()}` }
                });
                localStorage.setItem("bankToken", res.data.bankToken);
                navigate("/bank");
            } catch (err) {
                setError("Failed to set PIN. Please try again.");
            } finally { setLoading(false); }
            return;
        }

        // mode === "verify"
        setLoading(true);
        try {
            const res = await axios.post(`${API}/verify-pin`, { pin: pinStr }, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            localStorage.setItem("bankToken", res.data.bankToken);
            navigate("/bank");
        } catch (err) {
            if (err.response?.status === 401) {
                // Backend returns 401 for wrong PIN
                const msg = err.response?.data?.message || "Incorrect PIN. Try again.";
                setError(msg);
                triggerShake();
                setPin(["", "", "", ""]);
                setTimeout(() => inputs.current[0]?.focus(), 100);
            } else {
                setError("Could not connect to server. Please try again.");
            }
        } finally { setLoading(false); }
    };

    const titles = {
        set: { title: "Set Your Bank PIN", sub: "Choose a 4-digit PIN to secure your bank account" },
        confirm: { title: "Confirm Your PIN", sub: "Re-enter your PIN to confirm" },
        verify: { title: "Enter Bank PIN", sub: "Verify your identity to access Vault Bank" },
    };

    if (initializing) return (
        <div style={{
            minHeight: "100vh", background: "#060d1b",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", fontWeight: "600" }}>Loading...</div>
        </div>
    );

    return (
        <>
            <style>{`
        @keyframes pinShake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-8px); }
          40%,80% { transform: translateX(8px); }
        }
        .pin-shake { animation: pinShake 0.4s ease; }
        .pin-box {
          width: 56px; height: 64px;
          background: rgba(255,255,255,0.07);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          font-size: 28px; font-weight: 900;
          color: white; text-align: center;
          outline: none; caret-color: transparent;
          transition: border-color 0.2s, background 0.2s;
          font-family: monospace;
        }
        .pin-box:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.15);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pin-card { animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes orbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>

            <div style={{
                minHeight: "100vh", background: "#060d1b",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden", padding: "24px"
            }}>
                {/* Orbs */}
                <div style={{
                    position: "absolute", top: "5%", left: "10%", width: "350px", height: "350px",
                    background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
                    borderRadius: "50%", filter: "blur(50px)", animation: "orbFloat 10s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute", bottom: "5%", right: "10%", width: "300px", height: "300px",
                    background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)",
                    borderRadius: "50%", filter: "blur(50px)", animation: "orbFloat 13s ease-in-out 2s infinite reverse"
                }} />

                {/* Card */}
                <div className="pin-card" style={{
                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "28px",
                    padding: "48px 44px", width: "100%", maxWidth: "380px",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                    position: "relative", zIndex: 10, textAlign: "center"
                }}>
                    {/* Logo — white background so it's visible on dark */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(255,255,255,0.92)",
                        padding: "10px 20px", borderRadius: "16px",
                        marginBottom: "24px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                    }}>
                        <img src={logo} alt="Vault Goal" style={{ height: "40px" }} />
                    </div>

                    {/* Lock icon */}
                    <div style={{
                        background: "rgba(37,99,235,0.2)", width: "64px", height: "64px",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px"
                    }}>
                        <Lock size={28} color="#60a5fa" />
                    </div>

                    <h1 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: "900", color: "white" }}>
                        {titles[mode].title}
                    </h1>
                    <p style={{ margin: "0 0 32px", color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
                        {titles[mode].sub}
                    </p>

                    {/* PIN inputs */}
                    <div className={shake ? "pin-shake" : ""} style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
                        {pin.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={el => inputs.current[idx] = el}
                                className="pin-box"
                                type={showPin ? "text" : "password"}
                                maxLength={1}
                                value={digit}
                                onChange={e => handleInput(idx, e.target.value)}
                                onKeyDown={e => handleKey(idx, e)}
                                autoFocus={idx === 0}
                            />
                        ))}
                    </div>

                    {/* Show PIN toggle */}
                    <button onClick={() => setShowPin(!showPin)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center",
                        gap: "6px", fontSize: "13px", margin: "0 auto 20px", fontWeight: "600"
                    }}>
                        {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                        {showPin ? "Hide PIN" : "Show PIN"}
                    </button>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "10px", padding: "10px 14px", color: "#fca5a5",
                            fontSize: "13px", fontWeight: "600", marginBottom: "18px"
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button onClick={handleSubmit} disabled={loading} style={{
                        width: "100%", padding: "14px", background: "#2563eb", color: "white",
                        border: "none", borderRadius: "13px", fontWeight: "800", fontSize: "15px",
                        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                        fontFamily: "inherit", transition: "opacity 0.2s"
                    }}>
                        <ShieldCheck size={17} />
                        {loading ? "Verifying..." : mode === "verify" ? "Access Bank" : mode === "set" ? "Continue" : "Confirm PIN"}
                    </button>

                    {/* Back link */}
                    <button onClick={() => navigate("/dashboard")} style={{
                        marginTop: "18px", background: "none", border: "none",
                        color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "13px",
                        display: "flex", alignItems: "center", gap: "6px", fontWeight: "600",
                        fontFamily: "inherit", margin: "18px auto 0"
                    }}>
                        <ArrowLeft size={14} /> Back to Dashboard
                    </button>
                </div>
            </div>
        </>
    );
}
