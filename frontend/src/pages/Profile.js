import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Save, Trash2, ArrowLeft, CheckCircle } from "lucide-react";

const API = "http://localhost:5000/api";

export default function Profile() {
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [toast, setToast] = useState(null); // { msg, type }
    const [pwStrength, setPwStrength] = useState(0);
    const navigate = useNavigate();
    const token = () => localStorage.getItem("token");

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API}/user/profile`, { headers: { Authorization: `Bearer ${token()}` } });
            setProfile({ name: res.data.name || "", email: res.data.email || "" });
        } catch { showToast("Failed to load profile", "error"); }
        finally { setLoading(false); }
    };

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${API}/user/profile`, profile, { headers: { Authorization: `Bearer ${token()}` } });
            showToast("Profile updated successfully!");
        } catch (err) {
            showToast(err.response?.data?.message || "Update failed", "error");
        } finally { setSaving(false); }
    };

    const getStrength = (pw) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const handlePwChange = (e) => {
        const val = e.target.value;
        setPwForm(prev => ({ ...prev, newPassword: val }));
        setPwStrength(getStrength(val));
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) return showToast("Passwords do not match", "error");
        if (pwStrength < 2) return showToast("Password is too weak", "error");
        setPwSaving(true);
        try {
            await axios.put(`${API}/user/change-password`,
                { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
                { headers: { Authorization: `Bearer ${token()}` } }
            );
            showToast("Password changed!");
            setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
            setPwStrength(0);
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to change password", "error");
        } finally { setPwSaving(false); }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("⚠️ This will PERMANENTLY delete your account and all data. Are you sure?")) return;
        try {
            await axios.delete(`${API}/user/delete-account`, { headers: { Authorization: `Bearer ${token()}` } });
            localStorage.clear();
            navigate("/");
        } catch { showToast("Delete failed", "error"); }
    };

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
    const inputStyle = {
        width: "100%", padding: "12px 14px", borderRadius: "10px",
        border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: "600",
        boxSizing: "border-box", outline: "none", fontFamily: "inherit"
    };

    if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading profile...</div>;

    return (
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: "24px", right: "24px", zIndex: 9999,
                    background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
                    border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
                    color: toast.type === "error" ? "#991b1b" : "#166534",
                    padding: "12px 20px", borderRadius: "12px", fontWeight: "700", fontSize: "14px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "fadeInUp 0.3s ease"
                }}>
                    {toast.type !== "error" && <CheckCircle size={15} style={{ marginRight: "8px", display: "inline" }} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                <button onClick={() => navigate("/dashboard")} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#475569" }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>My Profile</h1>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Manage your account settings</p>
                </div>
            </div>

            {/* Profile Info */}
            <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                    <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "8px" }}><User size={18} color="#2563eb" /></div>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Personal Information</h2>
                </div>
                <form onSubmit={handleProfileSave} style={{ display: "grid", gap: "14px" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Full Name</label>
                        <input style={inputStyle} placeholder="Your full name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Email Address</label>
                        <input style={inputStyle} type="email" placeholder="your@email.com" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <button type="submit" disabled={saving} style={{ background: "#2563eb", color: "white", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", width: "fit-content", fontSize: "14px", opacity: saving ? 0.7 : 1 }}>
                        <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                    <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "8px" }}><Lock size={18} color="#059669" /></div>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Change Password</h2>
                </div>
                <form onSubmit={handlePasswordSave} style={{ display: "grid", gap: "14px" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Current Password</label>
                        <input style={inputStyle} type="password" placeholder="Enter current password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>New Password</label>
                        <input style={inputStyle} type="password" placeholder="Minimum 8 characters" value={pwForm.newPassword} onChange={handlePwChange} />
                        {pwForm.newPassword && (
                            <div style={{ marginTop: "8px" }}>
                                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ flex: 1, height: "4px", borderRadius: "4px", background: i <= pwStrength ? strengthColor[pwStrength] : "#e2e8f0", transition: "background 0.3s" }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Confirm New Password</label>
                        <input style={{ ...inputStyle, borderColor: pwForm.confirm && pwForm.confirm !== pwForm.newPassword ? "#ef4444" : "#e2e8f0" }} type="password" placeholder="Re-enter new password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
                        {pwForm.confirm && pwForm.confirm !== pwForm.newPassword && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>Passwords do not match</p>}
                    </div>
                    <button type="submit" disabled={pwSaving} style={{ background: "#059669", color: "white", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", width: "fit-content", fontSize: "14px", opacity: pwSaving ? 0.7 : 1 }}>
                        <Lock size={16} /> {pwSaving ? "Updating..." : "Change Password"}
                    </button>
                </form>
            </div>

            {/* Danger Zone */}
            <div style={{ background: "#fff1f2", borderRadius: "16px", padding: "24px 28px", border: "1px solid #fecdd3" }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "800", color: "#991b1b" }}>Danger Zone</h2>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#b91c1c" }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button onClick={handleDeleteAccount} style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                    <Trash2 size={16} /> Delete My Account
                </button>
            </div>
        </div>
    );
}
