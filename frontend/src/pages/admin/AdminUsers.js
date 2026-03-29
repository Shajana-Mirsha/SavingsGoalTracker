import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Pencil, X, UserPlus } from "lucide-react";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create form
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "", role: "USER" });

    // Edit form
    const [editUser, setEditUser] = useState(null); // holds the user being edited
    const [editData, setEditData] = useState({ email: "", role: "USER" });
    const [editLoading, setEditLoading] = useState(false);

    const token = () => localStorage.getItem("token");

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/admin/users", {
                headers: { Authorization: `Bearer ${token()}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Fetch users failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/admin/users", formData, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            setShowCreate(false);
            setFormData({ email: "", password: "", role: "USER" });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create user");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this user and all their data?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const openEdit = (user) => {
        setEditUser(user);
        setEditData({ email: user.email, role: user.role });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${editUser._id}`, editData, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setEditLoading(false);
        }
    };

    const Modal = ({ title, onClose, onSubmit, children }) => (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: "16px", width: "420px", padding: "30px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{title}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} style={{ display: "grid", gap: "14px" }}>
                    {children}
                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                        <button type="submit" style={{ flex: 1, background: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Save</button>
                        <button type="button" onClick={onClose} style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );

    const inputStyle = { padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", outline: "none" };
    const selectStyle = { ...inputStyle, background: "white" };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>User Management</h1>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>{users.length} registered users</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <UserPlus size={16} /> Add User
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <Modal title="Create New User" onClose={() => setShowCreate(false)} onSubmit={handleCreate}>
                    <input style={inputStyle} placeholder="Email" required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input style={inputStyle} placeholder="Password" required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <select style={selectStyle} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </Modal>
            )}

            {/* Edit Modal */}
            {editUser && (
                <Modal title={`Edit User`} onClose={() => setEditUser(null)} onSubmit={handleUpdate}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>USER ID: {editUser._id}</p>
                    <input style={inputStyle} placeholder="Email" required type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                    <select style={selectStyle} value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    {editLoading && <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Updating...</p>}
                </Modal>
            )}

            {/* Table */}
            <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <tr>
                            {["User ID", "Email", "Role", "Bank Balance", "Active Goals", "Actions"].map(h => (
                                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No users found.</td></tr>
                        ) : users.map(user => (
                            <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{ fontSize: "11px", fontFamily: "monospace", background: "#f1f5f9", borderRadius: "6px", padding: "3px 8px", color: "#475569", fontWeight: "700", letterSpacing: "0.5px" }}>
                                        #USR-{user._id.slice(-6).toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 16px", fontSize: "14px", color: "#334155", fontWeight: "600" }}>{user.email}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{
                                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800",
                                        background: user.role === "ADMIN" ? "#eff6ff" : "#f0fdf4",
                                        color: user.role === "ADMIN" ? "#1d4ed8" : "#166534"
                                    }}>{user.role}</span>
                                </td>
                                <td style={{ padding: "14px 16px", fontWeight: "700", color: "#059669" }}>₹{user.balance.toLocaleString()}</td>
                                <td style={{ padding: "14px 16px", color: "#475569", fontWeight: "600" }}>{user.goalCount}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => openEdit(user)} style={{ background: "#eff6ff", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#2563eb" }}>
                                            <Pencil size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(user._id)} style={{ background: "#fff1f2", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#ef4444" }}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
