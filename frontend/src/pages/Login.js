import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents page reload
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form className="glass-panel" style={{ width: '380px', textAlign: 'center' }} onSubmit={handleLogin}>
        <h2 style={{ marginBottom: '10px' }}>Welcome Back</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Log in to continue saving</p>
        
        <input 
          type="email" 
          placeholder="Email Address" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
          Login to Dashboard
        </button>
        
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register here</Link>
        </p>
        <a
  href="https://savingsgoaltracker.onrender.com/auth/google"
  style={{ textDecoration: "none" }}
>
  <button
    type="button"
    className="btn"
    style={{
      width: "100%",
      background: "#db4437",
      color: "white",
      marginTop: "10px"
    }}
  >
    Sign in with Google
  </button>
</a>

      </form>
    </div>
  );
}
