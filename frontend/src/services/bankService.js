import axios from "axios";

// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
};

const API_URL = "http://localhost:5000/api/bank";

const getAccount = async () => {
    const response = await axios.get(`${API_URL}/account`, getAuthHeaders());
    return response.data;
};

const getTransactions = async () => {
    const response = await axios.get(`${API_URL}/transactions`, getAuthHeaders());
    return response.data;
};

const creditAccount = async (amount) => {
    const response = await axios.post(`${API_URL}/credit`, { amount }, getAuthHeaders());
    return response.data;
};

const setupAccount = async (data) => {
    const response = await axios.post(`${API_URL}/setup`, data, getAuthHeaders());
    return response.data;
};

const debitAccount = async (amount) => {
    const response = await axios.post(`${API_URL}/debit`, { amount }, getAuthHeaders());
    return response.data;
};

const bankService = {
    getAccount,
    getTransactions,
    creditAccount,
    debitAccount,
    setupAccount
};

export default bankService;
