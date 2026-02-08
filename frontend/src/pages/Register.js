import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ email, password });
      alert("Registration successful! Now please login.");
      navigate("/"); // Move to login page
    } catch (error) {
      alert(error.response?.data?.message || "User already exists or server error");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form className="glass-panel" style={{ width: '380px', textAlign: 'center' }} onSubmit={handleRegister}>
        <h2 style={{ marginBottom: '10px' }}>Join Us</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Start tracking your financial goals</p>
        
        <input 
          type="email" 
          placeholder="Enter Email" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Create Password" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px', background: 'var(--accent)' }}>
          Create Account
        </button>
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
      marginTop: "12px"
    }}
  >
    Sign up with Google
  </button>
</a>

        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Already registered? <Link to="/" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
        </p>
      </form>
    </div>
  );
}
