import { useEffect, useState } from "react";
import { createGoal, getGoals } from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const API_BASE = "https://savingsgoaltracker.onrender.com/api";
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // New loading state
  const navigate = useNavigate();

  // 1. Process Google Token and URL Cleaning
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");

    if (googleToken) {
      localStorage.setItem("token", googleToken);
      setToken(googleToken);
      // Remove token from URL bar
      window.history.replaceState({}, document.title, "/dashboard");
    }
    setLoading(false); // Finished checking URL
  }, []);

  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addMap, setAddMap] = useState({});
  const [currentTab, setCurrentTab] = useState("active"); 
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [statsOffset, setStatsOffset] = useState(0);
  const [selectedBar, setSelectedBar] = useState(null);

  // 2. Load Data with Guard Logic
  const loadData = async () => {
    const params = new URLSearchParams(window.location.search);
    const hasTokenInUrl = params.has("token");

    // Don't redirect if we are currently loading OR if there's a token in the URL
    if (loading) return; 
    
    if (!token && !hasTokenInUrl) {
      navigate("/");
      return;
    }

    if (token) {
      try {
        const res = await getGoals(token);
        setGoals(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/");
        }
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [token, navigate, loading]); // Fires when token is set OR loading finishes

  useEffect(() => { 
    setStatsOffset(0); 
    setSelectedBar(null); 
  }, [currentTab]);

  // --- Helper Functions ---
  const filteredGoals = goals.filter(g => 
    g.goalName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeGoals = filteredGoals.filter(g => g.savedAmount < g.targetAmount);
  const achievedGoals = filteredGoals.filter(g => g.savedAmount >= g.targetAmount);

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return ""; 
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const deleteGoal = async (id) => {
    if (window.confirm("Delete this goal permanently?")) {
      try {
        await axios.delete(`https://savingsgoaltracker.onrender.com/api/goals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        loadData();
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  const getStats = (type) => {
    const stats = {};
    const count = 7;
    if (type === 'daily') {
      for (let i = (count - 1); i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i - (statsOffset * 7));
        stats[d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })] = 0;
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        const sun = new Date(d);
        sun.setDate(d.getDate() - d.getDay() - ((i + (statsOffset * 4)) * 7));
        stats[formatDateShort(sun)] = 0;
      }
    }
    goals.forEach(goal => {
      goal.history?.forEach(entry => {
        const date = new Date(entry.date);
        let label = type === 'daily' ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : formatDateShort(new Date(date.setDate(date.getDate() - date.getDay())));
        if (stats[label] !== undefined) stats[label] += entry.amount;
      });
    });
    return Object.entries(stats);
  };

  const renderStatsGraph = (type) => {
    const data = getStats(type);
    const maxVal = Math.max(...data.map(d => d[1]), 1);
    return (
      <div className="glass-panel" style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <p style={{ margin: 0, color: '#444', fontSize: '0.75rem', fontWeight: 'bold' }}>{type.toUpperCase()} SAVINGS</p>
            {selectedBar ? ( <h2 style={{ margin: '5px 0', color: 'var(--primary)', fontSize: '1.2rem' }}>{selectedBar.label}: {selectedBar.value}</h2> ) : ( <h2 style={{ margin: '5px 0', color: '#999', fontSize: '0.9rem' }}>Click a bar</h2> )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
          {data.map(([label, value]) => {
            const barHeight = (value / maxVal) * 120;
            const isSelected = selectedBar?.label === label;
            return (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedBar({label, value})}>
                <div style={{ width: '100%', height: `${Math.max(barHeight, 5)}px`, background: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.1)', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ marginTop: '8px', fontSize: '0.65rem', color: isSelected ? '#000' : '#666' }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getGroupedAchieved = () => {
    const groups = {};
    achievedGoals.forEach(goal => {
      const date = new Date(goal.completedAt || goal.updatedAt);
      const sun = new Date(date); sun.setDate(date.getDate() - date.getDay());
      const range = `${formatDateShort(sun)} - ${formatDateShort(new Date(sun.getTime() + 6*24*60*60*1000))}`;
      if (!groups[range]) groups[range] = [];
      groups[range].push(goal);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0].split(' - ')[0]) - new Date(a[0].split(' - ')[0]));
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Validating session...</div>;

  const isSidebarVisible = currentTab === 'active';

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
      {/* Header */}
      <div className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", padding: '15px 25px' }}>
        <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem' }}>Savings Goal Tracker</h2>
        <button className="btn" style={{ background: "#ff4757", color: "white", padding: '8px 16px', fontSize: '0.9rem',marginLeft: "auto" }} onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
        <button
          className="btn"
          style={{ background: "#000", color: "white", marginLeft: "10px" }}
          onClick={async () => {
            if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
              try {
                await axios.delete("https://savingsgoaltracker.onrender.com/api/user/delete-account", {
                  headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.clear();
                navigate("/");
              } catch (error) { alert("Failed to delete account"); }
            }
          }}
        >
          Delete Account
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type="text"
          placeholder="Search goals by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', padding: '12px 45px 12px 20px', borderRadius: '12px', border: '1px solid #ddd', 
            fontSize: '0.95rem', boxSizing: 'border-box', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ position: 'absolute', right: '15px', background: '#eee', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: '#666', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "25px" }}>
        <button className="btn" style={{ padding: '10px 15px', fontSize: '0.9rem', background: currentTab === 'active' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => setCurrentTab('active')}>ACTIVE ({activeGoals.length})</button>
        <button className="btn" style={{ padding: '10px 15px', fontSize: '0.9rem', background: currentTab === 'completed' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => setCurrentTab('completed')}>ACHIEVED ({achievedGoals.length})</button>
        <button className="btn" style={{ padding: '10px 15px', fontSize: '0.9rem', background: currentTab === 'daily' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => setCurrentTab('daily')}>DAILY</button>
        <button className="btn" style={{ padding: '10px 15px', fontSize: '0.9rem', background: currentTab === 'weekly' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => setCurrentTab('weekly')}>WEEKLY</button>
      </div>

      <div style={{ display: "flex", flexDirection: isSidebarVisible ? "row" : "column", gap: "25px" }}>
        {isSidebarVisible && (
          <div className="glass-panel" style={{ width: "280px", padding: "20px", boxSizing: 'border-box', flexShrink: 0, height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>New Goal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input style={{ width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '0.95rem' }} placeholder="Goal Name" value={goalName} onChange={(e) => setGoalName(e.target.value)} />
              <input style={{ width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '0.95rem' }} type="number" placeholder="Target" value={target} onChange={(e) => setTarget(e.target.value)} />
              <button className="btn btn-primary" style={{ width: "100%", padding: '10px', fontSize: '0.95rem' }} onClick={async () => { if(goalName && target) { await createGoal({ goalName, targetAmount: target }, token); setGoalName(""); setTarget(""); loadData(); } }}>Create Goal</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {(currentTab === 'daily' || currentTab === 'weekly') && renderStatsGraph(currentTab)}
          
          {currentTab === 'completed' && (
            getGroupedAchieved().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ff4757' }}>
                    <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>No completed goals found matching "<b>{searchQuery}</b>"</p>
                </div>
            ) : (
                getGroupedAchieved().map(([range, items]) => (
                    <div key={range} style={{ marginBottom: '30px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ height: '1px', flex: 1, background: '#ccc' }}></div>
                        <span style={{ fontWeight: '800', color: '#fff', background: '#333', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>{range.toUpperCase()}</span>
                        <div style={{ height: '1px', flex: 1, background: '#ccc' }}></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
                        {items.map(g => (
                          <div key={g._id} className="goal-card shadow" style={{ padding: '20px', height: 'fit-content' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{g.goalName}</h3>
                              <button onClick={() => deleteGoal(g._id)} style={{ color: '#ff4757', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>DELETE</button>
                            </div>
                            <div style={{ color: 'var(--accent)', fontWeight: '900', fontSize: '1.4rem', margin: '10px 0' }}>{g.targetAmount}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f5f6fa', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                              <div><span style={{ color: '#888', display: 'block', fontSize: '0.65rem' }}>CREATED</span><b>{formatDateOnly(g.createdAt)}</b></div>
                              <div style={{ textAlign: 'right' }}><span style={{ color: '#888', display: 'block', fontSize: '0.65rem' }}>COMPLETED</span><b style={{ color: '#2ed573' }}>{formatDateOnly(g.completedAt || g.updatedAt)}</b></div>
                            </div>
                            <button onClick={() => setExpandedGoal(expandedGoal === g._id ? null : g._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '12px' }}>{expandedGoal === g._id ? "Hide ▲" : "History ▼"}</button>
                            {expandedGoal === g._id && (
                              <div style={{ marginTop: '10px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                                {g.history.slice().reverse().map((e, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid #f9f9f9' }}>
                                    <span>{formatDateTime(e.date)}</span>
                                    <span style={{ color: '#2ed573', fontWeight: '700' }}>+ {e.amount}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
            )
          )}

          {currentTab === 'active' && (
            activeGoals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ff4757' }}>
                    <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>No active goals found matching "<b>{searchQuery}</b>"</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeGoals.map((g) => {
                  const pct = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
                  return (
                    <div key={g._id} className="goal-card shadow" style={{ padding: '20px', height: 'fit-content' }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{g.goalName}</h3>
                        <button onClick={() => deleteGoal(g._id)} style={{ color: '#ff4757', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>DELETE</button>
                      </div>
                      <div className="progress-bar-container" style={{ margin: '15px 0' }}><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ fontSize: '0.95rem' }}>
                          <p style={{ margin: 0 }}>Saved: <b>{g.savedAmount}</b> / {g.targetAmount}</p>
                          <p style={{ margin: '5px 0 0 0', color: 'var(--primary)', fontWeight: '700' }}>REMAINING: {g.targetAmount - g.savedAmount}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input style={{ width: "80px", padding: "8px", fontSize: '0.9rem' }} type="number" placeholder="Amt" value={addMap[g._id] || ""} onChange={(e) => setAddMap({...addMap, [g._id]: e.target.value})} />
                          <button 
  className="btn btn-add" 
  style={{ padding: '8px 16px', fontSize: '0.9rem' }} 
  onClick={async () => { 
    if(addMap[g._id] > 0) { 
      try {
        // 1. Changed 'amount' to 'savedAmount' to match backend requirements 
        await axios.put(
          `${API_BASE}/goals/${g._id}`,
          { savedAmount: Number(addMap[g._id]) }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 2. Clear the input field for this specific goal immediately 
        setAddMap(prev => ({...prev, [g._id]: ""}));

        // 3. Immediately re-fetch all goals to update the UI instantly [cite: 133]
        await loadData(); 

      } catch (err) {
        console.error("Error updating goal:", err);
      }
    } 
  }}
>
  Add
</button>
                        </div>
                      </div>
                      <button onClick={() => setExpandedGoal(expandedGoal === g._id ? null : g._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '15px' }}>{expandedGoal === g._id ? "Hide History ▲" : "View History ▼"}</button>
                      {expandedGoal === g._id && (
                        <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                          {g.history.slice().reverse().map((e, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                              <span>{formatDateTime(e.date)}</span>
                              <span style={{ color: '#2ed573', fontWeight: '700' }}>+ {e.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
