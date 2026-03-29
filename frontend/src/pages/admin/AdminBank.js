import { useEffect, useState } from "react";
import axios from "axios";
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";

const AdminBank = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [txnType, setTxnType] = useState("CREDIT");
    const [amount, setAmount] = useState("");
    const [purpose, setPurpose] = useState("");

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/admin/accounts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccounts(res.data);
        } catch (err) {
            console.error("Failed to fetch accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/admin/accounts/${selectedAccount._id}`, {
                amount, type: txnType, purpose
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedAccount(null);
            setAmount("");
            setPurpose("");
            fetchAccounts();
            alert("Transaction Successful");
        } catch (err) {
            alert("Transaction Failed");
        }
    };

    // Calculate Total Liquidity
    const totalLiquidity = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const filteredAccounts = accounts.filter(acc =>
        (acc.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountNumber?.toString().includes(searchTerm)
    );

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Banking System...</div>;

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "30px" }}>
                <div>
                    <h1 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "28px" }}>Bank Overview</h1>
                    <p style={{ margin: 0, color: "#64748b" }}>Manage user accounts and liquidity</p>
                </div>
                <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", padding: "20px", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.5)", minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", opacity: 0.9 }}>
                        <CreditCard size={18} /> <span>Total Liquidity</span>
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: "bold" }}>₹{totalLiquidity.toLocaleString()}</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ background: "white", padding: "15px", borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                        placeholder="Search by Email or Account Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "10px 10px 10px 40px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none", fontSize: "14px" }}
                    />
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", color: "#64748b", cursor: "pointer" }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Table */}
            <div style={{ background: "white", borderRadius: "0 0 12px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <tr>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>User</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Account Number</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Balance</th>
                            <th style={{ padding: "15px 20px", textAlign: "center", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Status</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map(acc => (
                            <tr key={acc._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "15px 20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "32px", height: "32px", background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontWeight: "bold", fontSize: "12px" }}>
                                            {acc.userId?.email?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <span style={{ fontWeight: "500", color: "#334155" }}>{acc.userId?.email || "Unknown"}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "15px 20px", color: "#64748b", fontFamily: "monospace" }}>{acc.accountNumber}</td>
                                <td style={{ padding: "15px 20px", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>₹{acc.balance.toLocaleString()}</td>
                                <td style={{ padding: "15px 20px", textAlign: "center" }}>
                                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>Active</span>
                                </td>
                                <td style={{ padding: "15px 20px", textAlign: "right" }}>
                                    <button
                                        onClick={() => setSelectedAccount(acc)}
                                        style={{ background: "white", border: "1px solid #e2e8f0", color: "#3b82f6", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500", transition: "all 0.2s" }}
                                        onMouseEnter={e => e.target.style.borderColor = "#3b82f6"}
                                        onMouseLeave={e => e.target.style.borderColor = "#e2e8f0"}
                                    >
                                        Fund / Deduct
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedAccount && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <form onSubmit={handleTransaction} style={{ background: "white", padding: "30px", borderRadius: "16px", width: "400px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "20px" }}>Manage Funds</h3>
                            <button type="button" onClick={() => setSelectedAccount(null)} style={{ background: "none", border: "none", fontSize: "24px", color: "#94a3b8", cursor: "pointer" }}>&times;</button>
                        </div>

                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
                            <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#64748b" }}>Target Account</p>
                            <p style={{ margin: 0, fontWeight: "bold", color: "#334155" }}>{selectedAccount.userId?.email}</p>
                            <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#64748b" }}>Current Balance: <span style={{ color: "#0f172a", fontWeight: "bold" }}>₹{selectedAccount.balance.toLocaleString()}</span></p>
                        </div>

                        <div style={{ display: "grid", gap: "15px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setTxnType("CREDIT")}
                                    style={{ padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: txnType === "CREDIT" ? "white" : "transparent", color: txnType === "CREDIT" ? "#16a34a" : "#64748b", boxShadow: txnType === "CREDIT" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                                >
                                    <TrendingUp size={16} style={{ verticalAlign: "text-bottom", marginRight: "5px" }} /> Credit (+)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTxnType("DEBIT")}
                                    style={{ padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: txnType === "DEBIT" ? "white" : "transparent", color: txnType === "DEBIT" ? "#dc2626" : "#64748b", boxShadow: txnType === "DEBIT" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                                >
                                    <TrendingDown size={16} style={{ verticalAlign: "text-bottom", marginRight: "5px" }} /> Debit (-)
                                </button>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Amount (₹)</label>
                                <div style={{ position: "relative" }}>
                                    <DollarSign size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        style={{ width: "100%", padding: "10px 10px 10px 35px", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", outline: "none" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Purpose</label>
                                <input
                                    placeholder="e.g. Bonus, Correction"
                                    value={purpose}
                                    onChange={e => setPurpose(e.target.value)}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none" }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{ marginTop: "10px", background: "#0f172a", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
                            >
                                Process Transaction
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminBank;
