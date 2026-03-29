import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bankService from "../services/bankService";
import { CreditCard, Plus, History, ArrowRight, ShieldCheck, Wallet, Banknote, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.svg";

const BankDashboard = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [showBalance, setShowBalance] = useState(false);

    // Setup Form State
    const [setupData, setSetupData] = useState({ accountNumber: "", balance: "" });
    const [setupError, setSetupError] = useState("");

    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            const data = await bankService.getAccount();
            setAccount(data);
        } catch (err) {
            console.error("Failed to fetch account", err);
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        setSetupError(null); // Clear previous errors

        if (!setupData.accountNumber || !setupData.balance) {
            setSetupError("Please fill all fields");
            return;
        }

        // AUTO-FIX: Remove spaces from card number and commas from balance
        const cleanAccount = setupData.accountNumber.replace(/\s+/g, '');
        const cleanBalance = setupData.balance.toString().replace(/[^0-9.]/g, '');

        const payload = {
            accountNumber: cleanAccount,
            balance: cleanBalance
        };

        try {
            await bankService.setupAccount(payload);
// Redirect to PIN setup for new users
navigate("/bank-pin");
        } catch (err) {
            console.error("Setup failed", err);

            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "/";
                return;
            }

            // Show strict error from backend
            const serverMsg = err.response?.data?.message;
            setSetupError(serverMsg || "Setup failed. Please try a different account number.");
        }
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount) return;
        try {
            await bankService.creditAccount(amount);
            setMessage("✓ Funds deposited successfully!");
            setAmount("");
            setShowAddMoney(false);
            fetchAccount();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("✗ Failed to deposit funds");
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!withdrawAmount) return;
        if (parseFloat(withdrawAmount) > account?.balance) {
            setMessage("✗ Insufficient balance");
            setTimeout(() => setMessage(""), 3000);
            return;
        }
        try {
            await bankService.debitAccount(withdrawAmount);
            setMessage("✓ Withdrawal successful!");
            setWithdrawAmount("");
            setShowWithdraw(false);
            fetchAccount();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("✗ Withdrawal failed");
        }
    };

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Banking Interface...</div>;

    // --- SETUP MODE (No Account Found) ---
    if (!account) {
        return (
            <div style={{ maxWidth: "500px", margin: "100px auto", padding: "40px", background: "white", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
                <div style={{ background: "#eff6ff", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <Banknote size={40} color="#2563eb" />
                </div>
                <h2 style={{ fontSize: "24px", color: "#1e293b", marginBottom: "10px" }}>Link Your Bank Account</h2>
                <p style={{ color: "#64748b", marginBottom: "30px", lineHeight: "1.6" }}>
                    To start tracking savings, please link your primary bank account details.
                </p>

                <form onSubmit={handleSetup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ textAlign: "left" }}>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "5px", display: "block" }}>ACCOUNT NUMBER / CARD NUMBER</label>
                        <input
                            className="pro-input"
                            placeholder="Enter 10-16 digit number"
                            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none" }}
                            value={setupData.accountNumber}
                            onChange={(e) => setSetupData({ ...setupData, accountNumber: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ textAlign: "left" }}>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "5px", display: "block" }}>INITIAL BALANCE (₹)</label>
                        <input
                            className="pro-input"
                            type="number"
                            placeholder="e.g. 50000"
                            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none" }}
                            value={setupData.balance}
                            onChange={(e) => setSetupData({ ...setupData, balance: e.target.value })}
                            required
                        />
                    </div>

                    {setupError && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600" }}>{setupError}</p>}

                    <button type="submit" className="btn-primary" style={{ padding: "15px", borderRadius: "12px", background: "#2563eb", color: "white", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "15px", marginTop: "10px" }}>
                        Link Account & Start Saving
                    </button>
                </form>
            </div>
        );
    }

    // --- NORMAL DASHBOARD (Account Exists) ---
    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "#2563eb", padding: "10px", borderRadius: "12px", color: "white" }}>
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "24px" }}>Banking Overview</h1>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Manage your liquidity and transfers</p>
                    </div>
                </div>
                <Link to="/dashboard" style={{ textDecoration: "none", color: "#64748b", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
                    &larr; Back to Goals
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" }}>

                {/* Visual Bank Card */}
                <div style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    borderRadius: "24px",
                    padding: "30px",
                    color: "white",
                    boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.3)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.9 }}>
                            <ShieldCheck size={18} />
                            <span style={{ fontWeight: "600", fontSize: "14px", letterSpacing: "1px" }}>VAULT BANK SECURE</span>
                        </div>
                        <CreditCard size={28} opacity={0.8} />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <p style={{ margin: 0, fontSize: "12px", opacity: 0.7, letterSpacing: "1px" }}>TOTAL BALANCE</p>
                            <button onClick={() => setShowBalance(!showBalance)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "6px", padding: "3px 6px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
                                {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <h2 style={{ margin: 0, fontSize: "42px", fontWeight: "700", letterSpacing: showBalance ? "0" : "4px" }}>
                            {showBalance ? `₹${(account.balance || 0).toLocaleString()}` : "₹•••••••"}
                        </h2>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                            <p style={{ margin: "0 0 5px 0", fontSize: "10px", opacity: 0.7, letterSpacing: "1px" }}>ACCOUNT NUMBER</p>
                            <p style={{ margin: 0, fontSize: "16px", fontFamily: "monospace", letterSpacing: "2px" }}>
                                •••• •••• {(account.accountNumber || "0000").slice(-4)}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.7 }}>STATUS</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#4ade80", fontWeight: "600", fontSize: "14px" }}>
                                <div style={{ width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%" }}></div>
                                Active
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions & Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Quick Actions */}
                    <div style={{ background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#334155" }}>Quick Actions</h3>

                        <div style={{ display: "flex", gap: "15px" }}>
                            <button
                                onClick={() => { setShowAddMoney(!showAddMoney); setShowWithdraw(false); }}
                                style={{ flex: 1, padding: "15px", border: "1px solid #e2e8f0", borderRadius: "12px", background: showAddMoney ? "#eff6ff" : "white", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                            >
                                <div style={{ background: "#dbeafe", color: "#2563eb", padding: "10px", borderRadius: "50%" }}><Plus size={20} /></div>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Deposit</span>
                            </button>

                            <button
                                onClick={() => { setShowWithdraw(!showWithdraw); setShowAddMoney(false); }}
                                style={{ flex: 1, padding: "15px", border: "1px solid #e2e8f0", borderRadius: "12px", background: showWithdraw ? "#fff1f2" : "white", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                            >
                                <div style={{ background: "#fee2e2", color: "#ef4444", padding: "10px", borderRadius: "50%" }}><ArrowRight size={20} /></div>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Withdraw</span>
                            </button>

                            <Link to="/bank/statement" style={{ flex: 1, textDecoration: "none" }}>
                                <button style={{ width: "100%", height: "100%", padding: "15px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "white", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                    <div style={{ background: "#f1f5f9", color: "#475569", padding: "10px", borderRadius: "50%" }}><History size={20} /></div>
                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>History</span>
                                </button>
                            </Link>
                        </div>

                        {/* Deposit Form */}
                        {showAddMoney && (
                            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
                                <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Deposit Funds</p>
                                <form onSubmit={handleAddMoney} style={{ display: "flex", gap: "10px" }}>
                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (₹)" min="1"
                                        style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} autoFocus />
                                    <button type="submit" style={{ padding: "0 20px", background: "#2563eb", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "700" }}>Confirm</button>
                                </form>
                            </div>
                        )}

                        {/* Withdraw Form */}
                        {showWithdraw && (
                            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
                                <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Withdraw Funds</p>
                                <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#94a3b8" }}>Available: ₹{account.balance.toLocaleString()}</p>
                                <form onSubmit={handleWithdraw} style={{ display: "flex", gap: "10px" }}>
                                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter amount (₹)" min="1" max={account.balance}
                                        style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", outline: "none", fontSize: "14px" }} autoFocus />
                                    <button type="submit" style={{ padding: "0 20px", background: "#ef4444", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "700" }}>Withdraw</button>
                                </form>
                            </div>
                        )}

                        {message && (
                            <div style={{ marginTop: "15px", padding: "10px", background: message.includes("✗") ? "#fee2e2" : "#dcfce7", color: message.includes("✗") ? "#991b1b" : "#166534", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textAlign: "center" }}>{message}</div>
                        )}
                    </div>

                    {/* Statement Preview CTA */}
                    <Link to="/bank/statement" style={{ textDecoration: "none" }}>
                        <div style={{ background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
                                    <History size={20} color="#64748b" />
                                </div>
                                <div>
                                    <h4 style={{ margin: "0 0 2px 0", color: "#334155", fontSize: "15px" }}>View Statement</h4>
                                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>Check past transactions</p>
                                </div>
                            </div>
                            <ArrowRight size={18} color="#cbd5e1" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BankDashboard;
