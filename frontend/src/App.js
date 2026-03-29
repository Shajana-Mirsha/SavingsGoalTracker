import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BankDashboard from "./pages/BankDashboard";
import BankStatement from "./pages/BankStatement";
import BankPinGate from "./pages/BankPinGate";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

// Admin Imports
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBank from "./pages/admin/AdminBank";
import AdminGoals from "./pages/admin/AdminGoals";
import AdminTransactions from "./pages/admin/AdminTransactions";

// Admin Route Protection
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token && role === "ADMIN" ? children : <Navigate to="/" />;
};

// Bank Route Protection — requires bankToken from PIN verification
const BankRoute = ({ children }) => {
  const bankToken = localStorage.getItem("bankToken");
  return bankToken ? children : <Navigate to="/bank-pin" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bank-pin" element={<BankPinGate />} />
        <Route path="/bank" element={<BankRoute><BankDashboard /></BankRoute>} />
        <Route path="/bank/statement" element={<BankRoute><BankStatement /></BankRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="banks" element={<AdminBank />} />
          <Route path="goals" element={<AdminGoals />} />
          <Route path="transactions" element={<AdminTransactions />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
