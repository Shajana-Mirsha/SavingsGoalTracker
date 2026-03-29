import { useEffect, useState } from "react";
import axios from "axios";
import { Users, CreditCard, FileText, Target, Activity, TrendingUp, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, totalTransactions: 0, totalGoals: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "#64748b" }}>
            <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading...
        </div>
    );

    if (error) return (
        <div style={{ padding: "32px", background: "#fff1f2", borderRadius: "16px", color: "#991b1b", fontWeight: "700", border: "1px solid #fecdd3" }}>
            ⚠️ {error}
            <br /><button onClick={fetchStats} style={{ marginTop: "12px", padding: "10px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Retry</button>
        </div>
    );

    const cards = [
        { title: "Total Users", value: stats.totalUsers, icon: <Users size={22} color="white" />, gradient: "linear-gradient(135deg, #6366f1, #4338ca)", glow: "rgba(99,102,241,0.3)", trend: "Registered Members" },
        { title: "Total Liquidity", value: `₹${stats.totalBalance.toLocaleString('en-IN')}`, icon: <CreditCard size={22} color="white" />, gradient: "linear-gradient(135deg, #10b981, #059669)", glow: "rgba(16,185,129,0.3)", trend: "Safe Reserve" },
        { title: "Active Goals", value: stats.totalGoals, icon: <Target size={22} color="white" />, gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)", glow: "rgba(139,92,246,0.3)", trend: "Across All Users" },
        { title: "Transactions", value: stats.totalTransactions, icon: <FileText size={22} color="white" />, gradient: "linear-gradient(135deg, #f59e0b, #d97706)", glow: "rgba(245,158,11,0.3)", trend: "All Time" },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <Activity size={22} color="#6366f1" />
                    <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>System Overview</h1>
                </div>
                <p style={{ margin: 0, color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Real-time platform statistics and monitoring</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "36px" }}>
                {cards.map(({ title, value, icon, gradient, glow, trend }) => (
                    <div key={title} style={{
                        background: "white", padding: "24px", borderRadius: "20px",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.06)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "default"
                    }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 30px -5px ${glow}`; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px -5px rgba(0,0,0,0.06)"; }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                            <div style={{ background: gradient, padding: "12px", borderRadius: "14px", boxShadow: `0 6px 16px -4px ${glow}` }}>{icon}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f8fafc", padding: "5px 10px", borderRadius: "20px" }}>
                                <TrendingUp size={12} color="#10b981" />
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>{trend}</span>
                            </div>
                        </div>
                        <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
                        <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>{value}</h2>
                    </div>
                ))}
            </div>

            {/* Quick Links section */}
            <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", padding: "28px", boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)" }}>
                <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>Quick Actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                    {[
                        { label: "Manage Users", icon: "👥", path: "/admin/users", color: "#e0e7ff" },
                        { label: "View Goals", icon: "🎯", path: "/admin/goals", color: "#d1fae5" },
                        { label: "Bank Accounts", icon: "🏦", path: "/admin/banks", color: "#fce7f3" },
                        { label: "Transactions", icon: "📊", path: "/admin/transactions", color: "#fef3c7" },
                    ].map(({ label, icon, color }) => (
                        <div key={label} style={{
                            background: color, padding: "20px 16px", borderRadius: "16px",
                            textAlign: "center", cursor: "pointer", transition: "transform 0.15s ease"
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
                            <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
