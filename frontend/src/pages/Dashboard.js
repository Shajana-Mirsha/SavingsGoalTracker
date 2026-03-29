import { useEffect, useState, useCallback } from "react";
import { createGoal, getGoals } from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee, Trash2, LogOut, Clock,
  TrendingUp, ArrowUpRight, Search, Target, UserX, Calendar, CheckCircle, ShieldCheck, Landmark
} from "lucide-react";
import logo from "../assets/logo.svg";

export default function Dashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBar, setSelectedBar] = useState(null);
  const [addMap, setAddMap] = useState({});
  const [extendMap, setExtendMap] = useState({});
  const [chartOffset, setChartOffset] = useState(0); // 0 = current period, 1 = prev, 2 = prev-prev...

  const [expandedId, setExpandedId] = useState(null);

  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const navigate = useNavigate();

  const loadData = useCallback(async (customToken) => {
    const activeToken = customToken || token;
    if (!activeToken) return;
    try {
      const res = await getGoals(activeToken);
      setGoals(res.data);
    } catch (err) { navigate("/"); }
    setLoading(false);
  }, [token, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");
    const googleRole = params.get("role"); // Get role from URL

    // Debugging logs
    if (googleRole) console.log("Google Role from URL:", googleRole);

    if (googleToken) {
      localStorage.setItem("token", googleToken);
      if (googleRole) localStorage.setItem("role", googleRole);
      setToken(googleToken);

      // Auto-redirect if Admin
      if (googleRole === "ADMIN") {
        window.location.href = "/admin/dashboard"; // Force reload/redirect
        return;
      }

      window.history.replaceState({}, document.title, "/dashboard");
      loadData(googleToken);
    } else {
      // Check existing local storage role
      const storedRole = localStorage.getItem("role");
      if (storedRole === "ADMIN") {
        navigate("/admin/dashboard");
        return;
      }
      loadData();
    }
  }, [loadData, navigate]);

  const handleCreateGoal = async () => {
    if (newName && newTarget) {
      await createGoal({ goalName: newName, targetAmount: newTarget, deadline: newDeadline }, token);
      setNewName("");
      setNewTarget("");
      setNewDeadline("");
      loadData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this milestone?")) {
      await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/goals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    }
  };

  const getWeekRange = (date) => {
    const d = new Date(date);
    const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
    const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
    const fmt = (dt) => dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `${fmt(sun)} - ${fmt(sat)}`;
  };

  const getAnalyticsData = (type) => {
    const stats = {};
    if (type === 'daily') {
      // Each offset = 7 days back
      const baseOffset = chartOffset * 7;
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i - baseOffset);
        stats[d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0;
      }
    } else if (type === 'weekly') {
      // Each offset = 4 weeks back
      const baseOffset = chartOffset * 4;
      for (let i = 3; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - ((i + baseOffset) * 7));
        stats[getWeekRange(d)] = 0;
      }
    } else if (type === 'monthly') {
      // Each offset = 6 months back
      const baseOffset = chartOffset * 6;
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i - baseOffset);
        stats[d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })] = 0;
      }
    }
    goals.forEach(g => {
      g.history?.forEach(h => {
        const d = new Date(h.date);
        let label = type === 'daily' ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : type === 'weekly' ? getWeekRange(d) : d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (stats[label] !== undefined) stats[label] += h.amount;
      });
    });
    return Object.entries(stats);
  };

  const filtered = goals.filter(g => g.goalName.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeG = filtered.filter(g => g.savedAmount < g.targetAmount);
  const achievedG = filtered.filter(g => g.savedAmount >= g.targetAmount);
  const netSavings = goals.reduce((acc, g) => acc + (g.savedAmount || 0), 0);

  if (loading) return null;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <img src={logo} alt="Vault Goal" style={{ height: '52px' }} />
        </div>

        <div style={{ marginBottom: '30px', cursor: 'pointer' }} onClick={() => navigate("/bank-pin")}>
          <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)' }}>BANKING</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0f172a', color: 'white', padding: '8px', borderRadius: '8px' }}><Landmark size={18} /></div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900' }}>Vault Bank</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>View Account</div>
            </div>
          </div>
        </div>

        {localStorage.getItem("role") === "ADMIN" && (
          <div style={{ marginBottom: '30px', cursor: 'pointer' }} onClick={() => navigate("/admin/dashboard")}>
            <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)' }}>ADMINISTRATION</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', background: 'var(--primary)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              <ShieldCheck size={18} />
              <div style={{ fontSize: '14px', fontWeight: '900' }}>Admin Panel</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
          <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)' }}><Target size={14} /> CREATE MILESTONE</label>
          <input className="pro-input" placeholder="Goal Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input className="pro-input" type="number" placeholder="Target ₹" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
          <input className="pro-input" type="date" min={new Date().toISOString().split("T")[0]} value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
          <button className="btn-primary" onClick={handleCreateGoal}>Create Goal</button>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => { localStorage.clear(); navigate("/"); }} className="pro-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f8fafc', border: 'none', marginBottom: '10px' }}>
            <LogOut size={18} /> Logout
          </button>
          <button onClick={async () => { if (window.confirm("Delete account?")) { await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/user/delete-account`, { headers: { Authorization: `Bearer ${token}` } }); localStorage.clear(); navigate("/"); } }} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>
            <UserX size={14} /> DELETE ACCOUNT
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <p style={{ fontWeight: '900', color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '2px', marginBottom: '5px' }}>NET SAVINGS</p>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: 0 }}>₹{netSavings.toLocaleString('en-IN')}</h1>
          </div>
          <div style={{ position: 'relative', maxWidth: '200px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input className="pro-input" style={{ paddingLeft: '35px', width: '100%', fontSize: '13px' }} placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </header>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          {['active', 'completed', 'daily', 'weekly', 'monthly'].map(t => (
            <button key={t} onClick={() => { setCurrentTab(t); setSelectedBar(null); setChartOffset(0); }} style={{
              padding: '12px 20px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer',
              background: currentTab === t ? 'var(--primary)' : '#e2e8f0',
              color: currentTab === t ? 'white' : 'var(--text-muted)'
            }}>{t.toUpperCase()} {t === 'active' ? `(${activeG.length})` : t === 'completed' ? `(${achievedG.length})` : ''}</button>
          ))}
        </div>

        {(currentTab === 'daily' || currentTab === 'weekly' || currentTab === 'monthly') && (
          <div className="bar-container">
            <div style={{ position: 'absolute', top: '25px', left: '30px' }}>
              <p style={{ margin: 0, fontWeight: '900', color: 'var(--text-muted)', fontSize: '12px' }}>INTERACTIVE SAVINGS</p>
              <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '2rem' }}>
                {selectedBar ? `₹${selectedBar.val.toLocaleString()}` : "Click a bar for exact ₹"}
              </h2>
            </div>

            {/* Prev / Next Navigation */}
            <div style={{ position: 'absolute', top: '25px', right: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => { setChartOffset(o => o + 1); setSelectedBar(null); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: '800', color: '#475569', fontSize: '16px' }}
                title="Previous period"
              >‹ Prev</button>
              {chartOffset > 0 && (
                <button
                  onClick={() => { setChartOffset(o => o - 1); setSelectedBar(null); }}
                  style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: '800', color: 'white', fontSize: '16px' }}
                  title="Next period"
                >Next ›</button>
              )}
              {chartOffset > 0 && (
                <button
                  onClick={() => { setChartOffset(0); setSelectedBar(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', color: 'var(--primary)', fontSize: '12px', textDecoration: 'underline' }}
                >Today</button>
              )}
            </div>

            {getAnalyticsData(currentTab).map(([lbl, val]) => {
              const maxVal = Math.max(...getAnalyticsData(currentTab).map(v => v[1])) || 1;
              const isActive = selectedBar?.lbl === lbl;
              return (
                <div key={lbl} className="bar-item" onClick={() => setSelectedBar({ lbl, val })}>
                  <div className={`bar-fill ${isActive ? 'active' : ''}`} style={{ height: `${(val / maxVal) * 240}px` }}></div>
                  <div style={{ fontWeight: '800', fontSize: '11px', color: 'var(--text-muted)' }}>{lbl}</div>
                </div>
              );
            })}
          </div>
        )}


        {/* Added alignItems: 'start' below to prevent neighboring cards from stretching */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {(currentTab === 'active' ? activeG : achievedG).map(g => (
            <GoalCard
              key={g._id}
              goal={g}
              isCompleted={g.savedAmount >= g.targetAmount}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onDelete={() => handleDelete(g._id)}
              addMap={addMap}
              setAddMap={setAddMap}
              extendMap={extendMap}
              setExtendMap={setExtendMap}
              onRefresh={loadData}
              token={token}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function GoalCard({ goal, isCompleted, expandedId, setExpandedId, addMap, setAddMap, extendMap, setExtendMap, onRefresh, onDelete, token }) {
  const isExpanded = expandedId !== null && expandedId === goal._id;
  const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
  const isOverdue = !isCompleted && goal.deadline && new Date(goal.deadline) < new Date();

  return (
    <div className="card-pro" style={{ borderTop: isCompleted ? '6px solid var(--success)' : isOverdue ? '6px solid var(--danger)' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '24px', margin: '0 0 5px 0', fontWeight: '800' }}>{goal.goalName}</h3>
          <p style={{ fontWeight: '800', color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>
            STARTED: {new Date(goal.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge ${isCompleted ? 'badge-success' : isOverdue ? 'badge-overdue' : 'badge-active'}`}>
            {isCompleted ? 'Achieved' : isOverdue ? 'Overdue' : 'Active'}
          </span>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Trash2 size={20} /></button>
        </div>
      </div>

      {!isCompleted && (
        <p style={{ fontWeight: '900', color: isOverdue ? 'var(--danger)' : 'var(--primary)', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} /> TARGET DATE: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-IN') : 'NOT SET'}
        </p>
      )}

      {isCompleted ? (
        /* Added marginBottom: '20px' below to create space for the button */
        <div style={{ background: '#f0fdf4', padding: '25px', borderRadius: '20px', textAlign: 'center', border: '1px solid #dcfce7', marginBottom: '20px' }}>
          <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#166534', marginBottom: '5px' }}>TOTAL ACHIEVED SAVINGS</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--success)' }}>₹{goal.targetAmount.toLocaleString()}</div>
          <p style={{ fontSize: '11px', color: '#15803d', fontWeight: '800', marginTop: '10px', margin: 0 }}>Completed on {new Date(goal.updatedAt).toLocaleDateString('en-IN')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '15px' }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)' }}>TARGET</div>
            <div style={{ fontSize: '16px', fontWeight: '900' }}>₹{goal.targetAmount.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '15px' }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)' }}>SAVED</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--success)' }}>₹{goal.savedAmount.toLocaleString()}</div>
          </div>
          <div style={{ background: isOverdue ? '#fff1f2' : '#f8fafc', padding: '12px', borderRadius: '15px' }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: isOverdue ? '#991b1b' : 'var(--text-muted)' }}>REMAINING</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: isOverdue ? 'var(--danger)' : 'var(--text-main)' }}>₹{(goal.targetAmount - goal.savedAmount).toLocaleString()}</div>
          </div>
        </div>
      )}

      {!isCompleted && (
        <>
          <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: isOverdue ? 'var(--danger)' : 'var(--primary)', transition: '1.2s' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '16px' }}>{pct}% COMPLETE</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              {isOverdue && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="pro-input" style={{ width: '130px', padding: '8px' }} type="date" min={new Date().toISOString().split("T")[0]} value={extendMap?.[goal._id] || ""} onChange={(e) => setExtendMap({ ...extendMap, [goal._id]: e.target.value })} />
                  <button className="btn-primary" style={{ padding: '8px 12px', background: 'var(--success)' }} onClick={async () => {
                    if (extendMap[goal._id]) {
                      try {
                        await axios.put(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/goals/${goal._id}/extend`, { deadline: extendMap[goal._id] }, { headers: { Authorization: `Bearer ${token}` } });
                        setExtendMap({ ...extendMap, [goal._id]: "" });
                        onRefresh();
                      } catch (err) {
                        alert(err.response?.data?.message || "Extension failed");
                      }
                    }
                  }}>Extend Date</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="pro-input" style={{ width: '100px', padding: '10px' }} type="number" placeholder="₹" value={addMap?.[goal._id] || ""} onChange={(e) => setAddMap({ ...addMap, [goal._id]: e.target.value })} />
                <button className="btn-primary" style={{ padding: '10px' }} onClick={async () => {
                  if (addMap[goal._id] > 0) {
                    try {
                      await axios.put(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/goals/${goal._id}`, { savedAmount: Number(addMap[goal._id]) }, { headers: { Authorization: `Bearer ${token}` } });
                      setAddMap({ ...addMap, [goal._id]: "" });
                      onRefresh();
                    } catch (err) {
                      alert(err.response?.data?.message || "Transaction failed");
                    }
                  }
                }}><ArrowUpRight size={20} /></button>
              </div>
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setExpandedId(isExpanded ? null : goal._id)}
        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
      >
        <Clock size={18} /> {isExpanded ? 'HIDE HISTORY' : 'VIEW LEDGER HISTORY'}
      </button>

      {isExpanded && (
        <div style={{ marginTop: '15px', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)' }}>
          {goal.history && goal.history.length > 0 ? (
            goal.history.slice().reverse().map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '14px' }}>
                <span>
                  {new Date(h.date).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })}
                </span>
                <span style={{ color: 'var(--success)' }}>+ ₹{h.amount.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>No transactions found.</p>
          )}
        </div>
      )}
    </div>
  );
}
