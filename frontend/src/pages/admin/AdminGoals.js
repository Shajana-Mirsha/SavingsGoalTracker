import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter, Target, Edit2, Trash2, TrendingUp } from "lucide-react";

const AdminGoals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Edit State
    const [editingGoal, setEditingGoal] = useState(null);
    const [formData, setFormData] = useState({ goalName: "", targetAmount: "", deadline: "" });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/admin/goals", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals(res.data);
        } catch (err) {
            console.error("Failed to fetch goals");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this goal?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/admin/goals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGoals();
        } catch (err) { alert("Failed to delete goal"); }
    };

    const startEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            goalName: goal.goalName,
            targetAmount: goal.targetAmount,
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ""
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/admin/goals/${editingGoal._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingGoal(null);
            fetchGoals();
        } catch (err) {
            alert("Failed to update goal");
        }
    };

    const filteredGoals = goals.filter(g =>
        !g.isDeleted && (
            g.goalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalGoals = goals.filter(g => !g.isDeleted).length;
    const totalSaved = goals.filter(g => !g.isDeleted).reduce((sum, g) => sum + g.savedAmount, 0);

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Goals...</div>;

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "30px" }}>
                <div>
                    <h1 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "28px" }}>Savings Goals</h1>
                    <p style={{ margin: 0, color: "#64748b" }}>Track and manage all user goals</p>
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ background: "white", padding: "15px 25px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", color: "#64748b", fontSize: "14px" }}>
                            <Target size={16} /> <span>Active Goals</span>
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a" }}>{totalGoals}</div>
                    </div>
                    <div style={{ background: "white", padding: "15px 25px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", color: "#64748b", fontSize: "14px" }}>
                            <TrendingUp size={16} /> <span>Total Saved</span>
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>₹{totalSaved.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ background: "white", padding: "15px", borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                        placeholder="Search Goals or Users..."
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
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Goal Name</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>User</th>
                            <th style={{ padding: "15px 20px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Progress</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Target</th>
                            <th style={{ padding: "15px 20px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGoals.map(goal => {
                            const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                            return (
                                <tr key={goal._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "15px 20px", fontWeight: "600", color: "#0f172a" }}>{goal.goalName}</td>
                                    <td style={{ padding: "15px 20px", color: "#64748b" }}>{goal.userId?.email}</td>
                                    <td style={{ padding: "15px 20px", width: "30%" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                            <span style={{ fontWeight: "600", color: "#3b82f6" }}>₹{goal.savedAmount.toLocaleString()}</span>
                                            <span style={{ color: "#64748b" }}>{percent.toFixed(0)}%</span>
                                        </div>
                                        <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${percent}%`, background: "#3b82f6", borderRadius: "3px" }}></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "15px 20px", textAlign: "right", fontWeight: "bold", color: "#64748b" }}>₹{goal.targetAmount.toLocaleString()}</td>
                                    <td style={{ padding: "15px 20px", textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                            <button onClick={() => startEdit(goal)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "white", color: "#3b82f6", cursor: "pointer" }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(goal._id)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "white", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {editingGoal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <form onSubmit={handleUpdate} style={{ background: "white", padding: "30px", borderRadius: "16px", width: "400px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "20px" }}>Edit Goal</h3>
                            <button type="button" onClick={() => setEditingGoal(null)} style={{ background: "none", border: "none", fontSize: "24px", color: "#94a3b8", cursor: "pointer" }}>&times;</button>
                        </div>
                        <div style={{ display: "grid", gap: "15px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Goal Name</label>
                                <input required value={formData.goalName} onChange={e => setFormData({ ...formData, goalName: e.target.value })} style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Target Amount (₹)</label>
                                <input required type="number" value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Deadline</label>
                                <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none" }} />
                            </div>
                            <button
                                type="submit"
                                style={{ marginTop: "10px", background: "#0f172a", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminGoals;
