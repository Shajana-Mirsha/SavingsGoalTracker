import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter, RotateCcw, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleReverse = async (id) => {
        if (!window.confirm("Reverse this transaction? This will create a counter-transaction.")) return;
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/transactions/${id}/reverse`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Transaction reversed successfully.");
            fetchTransactions();
        } catch (err) {
            alert("Failed to reverse transaction.");
        }
    };

    const filteredTxns = transactions.filter(txn =>
        (txn.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.purpose || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Transactions...</div>;

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "30px" }}>
                <div>
                    <h1 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "28px" }}>Transaction Log</h1>
                    <p style={{ margin: 0, color: "#64748b" }}>Audit and manage system transactions</p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ background: "white", padding: "15px", borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                        placeholder="Search by User or Purpose..."
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
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Date</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>User</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Type</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Amount</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Purpose</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTxns.map(txn => (
                            <tr key={txn._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "15px 20px", fontSize: "14px", color: "#64748b" }}>
                                    {new Date(txn.createdAt).toLocaleDateString()} <span style={{ fontSize: "12px", opacity: 0.7 }}>{new Date(txn.createdAt).toLocaleTimeString()}</span>
                                </td>
                                <td style={{ padding: "15px 20px", fontWeight: "500", color: "#334155" }}>{txn.userId?.email}</td>
                                <td style={{ padding: "15px 20px" }}>
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: "5px",
                                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                                        background: txn.type === "CREDIT" ? "#dcfce7" : "#fee2e2",
                                        color: txn.type === "CREDIT" ? "#166534" : "#991b1b"
                                    }}>
                                        {txn.type === "CREDIT" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                        {txn.type}
                                    </span>
                                </td>
                                <td style={{ padding: "15px 20px", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>₹{txn.amount.toLocaleString()}</td>
                                <td style={{ padding: "15px 20px", color: "#64748b", fontSize: "14px" }}>{txn.purpose}</td>
                                <td style={{ padding: "15px 20px", textAlign: "right" }}>
                                    {!txn.purpose.startsWith("Reversal") && (
                                        <button
                                            onClick={() => handleReverse(txn._id)}
                                            style={{ background: "white", border: "1px solid #e2e8f0", color: "#f59e0b", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                        >
                                            <RotateCcw size={14} /> Reverse
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTransactions;
