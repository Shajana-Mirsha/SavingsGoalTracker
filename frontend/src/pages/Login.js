import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { IndianRupee, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) { alert("Invalid Credentials"); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}>
      <div className="card-pro" style={{ width: '450px', padding: '50px', textAlign: 'center' }}>
        <div style={{ background: 'var(--primary)', color: 'white', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
          <IndianRupee size={36} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Project Vault</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px' }}>Secure access to your Indian milestones</p>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
          <input className="pro-input" type="email" placeholder="Email Address" required onChange={(e) => setEmail(e.target.value)} />
          <input className="pro-input" type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <LogIn size={20} /> Sign In
          </button>
        </form>

        <div style={{ margin: '25px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
          <hr style={{ flex: 1, border: '0.5px solid #e2e8f0' }} /> <span>OR</span> <hr style={{ flex: 1, border: '0.5px solid #e2e8f0' }} />
        </div>

        <a href="https://savingsgoaltracker.onrender.com/api/auth/google" style={{ textDecoration: 'none' }}>
          <button className="pro-input" style={{ background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="22" alt="G" />
            <span style={{ fontWeight: '700' }}>Continue with Google</span>
          </button>
        </a>

        <p style={{ marginTop: '35px', color: 'var(--text-muted)' }}>
          New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>Register Workspace</Link>
        </p>
      </div>
    </div>
  );
}
