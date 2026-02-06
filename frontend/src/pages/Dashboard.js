import { useEffect, useState } from "react";
import { createGoal, getGoals } from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState("");
  const [addMap, setAddMap] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const load = async () => {
    try {
      const res = await getGoals(token);
      setGoals(res.data);
    } catch { navigate("/"); }
  };

  useEffect(() => { load(); }, []);

  const onAddGoal = async () => {
    if (!goalName || !target) return alert("Please fill details");
    await createGoal({ goalName, targetAmount: target }, token);
    setGoalName(""); setTarget("");
    load();
  };

  const onUpdateSavings = async (id) => {
    const amount = addMap[id];
    if (!amount) return;
    await axios.put(`http://localhost:5000/api/goals/${id}`, 
      { savedAmount: amount }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAddMap({ ...addMap, [id]: "" });
    load();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🎯 My Savings Tracker</h1>
        <button className="btn" style={{ background: '#ff4757', color: 'white' }} 
          onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left: Add Goal */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h3>New Saving Goal</h3>
          <input placeholder="Goal Name" value={goalName} onChange={e => setGoalName(e.target.value)} />
          <input type="number" placeholder="Target Amount (₹)" value={target} onChange={e => setTarget(e.target.value)} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onAddGoal}>Create Goal</button>
        </div>

        {/* Right: Goals List */}
        <div>
          {goals.map(g => {
            const pct = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
            return (
              <div key={g._id} className="goal-card shadow">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>{g.goalName}</h3>
                  <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{pct}%</span>
                </div>
                
                <div className="progress-bar-container">
                  <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p>Saved: <b>₹{g.savedAmount}</b> / ₹{g.targetAmount}</p>
                  <div>
                    <input style={{ width: '80px', margin: 0 }} type="number" placeholder="₹" 
                      value={addMap[g._id] || ""} onChange={e => setAddMap({ ...addMap, [g._id]: e.target.value })} />
                    <button className="btn btn-add" onClick={() => onUpdateSavings(g._id)}>Add</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}