import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Users, CreditCard, Target, FileText, LogOut, BarChart2, ShieldCheck } from "lucide-react";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const navItems = [
        { to: "/admin/dashboard", icon: <BarChart2 size={18} />, label: "Dashboard" },
        { to: "/admin/users", icon: <Users size={18} />, label: "Users" },
        { to: "/admin/banks", icon: <CreditCard size={18} />, label: "Bank Accounts" },
        { to: "/admin/goals", icon: <Target size={18} />, label: "Savings Goals" },
        { to: "/admin/transactions", icon: <FileText size={18} />, label: "Transactions" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            {/* Sidebar */}
            <aside style={{
                width: "260px", flexShrink: 0,
                background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                color: "white", padding: "0",
                display: "flex", flexDirection: "column",
                boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
            }}>
                {/* Branding */}
                <div style={{ padding: "28px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "rgba(99,102,241,0.2)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.3)" }}>
                            <ShieldCheck size={20} color="#818cf8" />
                        </div>
                        <div>
                            <div style={{ fontSize: "15px", fontWeight: "900", color: "#f1f5f9" }}>Vault Admin</div>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>CONTROL PANEL</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "#475569", letterSpacing: "1.5px", padding: "8px 12px 4px" }}>NAVIGATION</div>
                    {navItems.map(({ to, icon, label }) => {
                        const active = location.pathname === to;
                        return (
                            <Link key={to} to={to} style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                padding: "11px 14px", textDecoration: "none",
                                borderRadius: "12px", transition: "all 0.2s ease",
                                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                                border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                                color: active ? "#818cf8" : "#94a3b8",
                                fontWeight: active ? "800" : "600", fontSize: "14px"
                            }}>
                                <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
                                {label}
                                {active && <div style={{ marginLeft: "auto", width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%" }}></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <button onClick={handleLogout} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                        color: "#f87171", cursor: "pointer", padding: "11px 14px",
                        width: "100%", borderRadius: "12px", fontWeight: "700", fontSize: "14px",
                        transition: "all 0.2s ease"
                    }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
