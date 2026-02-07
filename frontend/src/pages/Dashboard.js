import { useEffect, useState } from "react";
import { createGoal, getGoals } from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState("");
  const [addMap, setAddMap] = useState({});

  // ✅ Read token once and freeze it
  const [token] = useState(() => localStorage.getItem("token"));
  const navigate = useNavigate();

  // ✅ Load goals safely
  useEffect(() => {
    const load = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await getGoals(token);
        setGoals(res.data);
      } catch (err) {
        // 🔴 Logout ONLY if token is invalid
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          navigate("/");
        }
        console.error(err);
      }
    };

    load();
  }, [token, navigate]);

  // ✅ Add new goal
  const onAddGoal = async () => {
    if (!goalName || !target) {
      alert("Please fill all details");
      return;
    }

    await createGoal(
      { goalName, targetAmount: target },
      token
    );

    setGoalName("");
    setTarget("");

    const res = await getGoals(token);
    setGoals(res.data);
  };

  // ✅ Add savings (incremental)
  const onUpdateSavings = async (id) => {
    const amount = Number(addMap[id]);
    if (!amount || amount <= 0) return;

    await axios.put(
      `http://localhost:5000/api/goals/${id}`,
      { savedAmount: amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAddMap({ ...addMap, [id]: "" });

    const res = await getGoals(token);
    setGoals(res.data);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      
      {/* HEADER */}
      <div
        className="glass-panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >
        <h1>🎯 My Savings Tracker</h1>
        <button
          className="btn"
          style={{ background: "#ff4757", color: "white" }}
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
        
        {/* LEFT: ADD GOAL */}
        <div className="glass-panel" style={{ height: "fit-content" }}>
          <h3>New Saving Goal</h3>
          <input
            placeholder="Goal Name"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Target Amount (₹)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={onAddGoal}
          >
            Create Goal
          </button>
        </div>

        {/* RIGHT: GOALS LIST */}
        <div>
          {goals.length === 0 && (
            <p style={{ textAlign: "center" }}>No goals added yet.</p>
          )}

          {goals.map((g) => {
            const pct = Math.min(
              Math.round((g.savedAmount / g.targetAmount) * 100),
              100
            );

            return (
              <div key={g._id} className="goal-card shadow">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3>{g.goalName}</h3>
                  <span style={{ fontWeight: "bold", color: "#4f46e5" }}>
                    {pct}%
                  </span>
                </div>

                <div className="progress-bar-container">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <p>
                    Saved: <b>₹{g.savedAmount}</b> / ₹{g.targetAmount}
                  </p>

                  <div>
                    <input
                      style={{ width: "80px", margin: 0 }}
                      type="number"
                      placeholder="₹"
                      value={addMap[g._id] || ""}
                      onChange={(e) =>
                        setAddMap({
                          ...addMap,
                          [g._id]: e.target.value
                        })
                      }
                    />
                    <button
                      className="btn btn-add"
                      onClick={() => onUpdateSavings(g._id)}
                    >
                      Add
                    </button>
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
