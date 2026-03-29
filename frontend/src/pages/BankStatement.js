import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bankService from "../services/bankService";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, FileText, Search, Download } from "lucide-react";

const BankStatement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | CREDIT | DEBIT

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await bankService.getTransactions();
            setTransactions(data);
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTxns = transactions.filter(txn =>
        txn.purpose.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (typeFilter === "ALL" || txn.type === typeFilter)
    );

    const exportCSV = () => {
        const headers = ["Date", "Time", "Type", "Description", "Amount (INR)", "Balance After (INR)"];
        const rows = filteredTxns.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            new Date(t.createdAt).toLocaleTimeString(),
            t.type,
            `"${t.purpose}"`,
            t.amount,
            t.balanceAfter
        ]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `vault-bank-statement-${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Statement...</div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "#475569", padding: "10px", borderRadius: "12px", color: "white" }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "24px" }}>Account Statement</h1>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Transaction history for Vault Bank</p>
                    </div>
                </div>
                <Link to="/bank" style={{ textDecoration: "none", color: "#64748b", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>

            {/* Controls */}
            <div style={{ background: "white", padding: "15px 20px", borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                {/* Type Filter */}
                <div style={{ display: "flex", gap: "8px" }}>
                    {["ALL", "CREDIT", "DEBIT"].map(f => (
                        <button key={f} onClick={() => setTypeFilter(f)} style={{
                            padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "12px",
                            background: typeFilter === f ? (f === "CREDIT" ? "#dcfce7" : f === "DEBIT" ? "#fee2e2" : "#0f172a") : "#f1f5f9",
                            color: typeFilter === f ? (f === "CREDIT" ? "#166534" : f === "DEBIT" ? "#991b1b" : "white") : "#64748b"
                        }}>{f}</button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {/* Search */}
                    <div style={{ position: "relative" }}>
                        <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: "8px 10px 8px 34px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none", fontSize: "13px", width: "180px" }} />
                    </div>
                    {/* CSV Export */}
                    <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "white", borderRadius: "0 0 12px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <tr>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Date</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Type</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Description</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Amount</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTxns.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No transactions found matching your search.</td>
                            </tr>
                        ) : (
                            filteredTxns.map((txn) => (
                                <tr key={txn._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "15px 20px", fontSize: "14px", color: "#64748b" }}>
                                        {new Date(txn.createdAt).toLocaleDateString()} <span style={{ fontSize: "12px", opacity: 0.7 }}>{new Date(txn.createdAt).toLocaleTimeString()}</span>
                                    </td>
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
                                    <td style={{ padding: "15px 20px", color: "#334155", fontWeight: "500", fontSize: "14px" }}>{txn.purpose}</td>
                                    <td style={{ padding: "15px 20px", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>₹{txn.amount.toLocaleString()}</td>
                                    <td style={{ padding: "15px 20px", textAlign: "right", color: "#64748b", fontFamily: "monospace", fontSize: "14px" }}>₹{txn.balanceAfter.toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BankStatement;
