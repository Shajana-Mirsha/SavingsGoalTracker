import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { IndianRupee, UserPlus, Mail, Lock, User } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert("Registration Successful! Please Login.");
      navigate("/"); 
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed. Email might already exist.");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div className="card-pro" style={{ width: '450px', padding: '50px', textAlign: 'center', background: 'white' }}>
        
        {/* Logo */}
        <div style={{ background: 'var(--primary)', color: 'white', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
          <IndianRupee size={32} strokeWidth={3} />
        </div>

        <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', letterSpacing: '-1.5px', fontWeight: '900' }}>Join Vault.Pro</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '35px' }}>Start tracking your Indian financial milestones</p>

        {/* Registration Form */}
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: '18px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              className="pro-input" style={{ paddingLeft: '45px' }} 
              placeholder="Full Name" required 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              className="pro-input" style={{ paddingLeft: '45px' }} 
              type="email" placeholder="Email Address" required 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              className="pro-input" style={{ paddingLeft: '45px' }} 
              type="password" placeholder="Create Password" required 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <UserPlus size={20} /> Register Workspace
          </button>
        </form>

        {/* --- PROFESSIONAL DIVIDER --- */}
        <div style={{ margin: '25px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
          <hr style={{ flex: 1, border: '0.5px solid #e2e8f0' }} /> 
          <span style={{ fontSize: '12px', fontWeight: '800' }}>OR</span> 
          <hr style={{ flex: 1, border: '0.5px solid #e2e8f0' }} />
        </div>

        {/* --- GOAL: SIGN IN WITH GOOGLE --- */}
        <button 
          type="button"
          className="pro-input" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'white' }}
          onClick={() => window.location.href = "https://savingsgoaltracker.onrender.com/api/auth/google"}
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="22" alt="G" />
          <span style={{ fontWeight: '700' }}>Continue with Google</span>
        </button>

        <p style={{ marginTop: '35px', color: 'var(--text-muted)', fontWeight: '600' }}>
          Already have an account? <Link to="/" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
