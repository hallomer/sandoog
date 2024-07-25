import axios from 'axios';
import userService from './userService';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const budgetService = {
  getAllBudgets: async (token) => {
    await userService.refreshToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getBudget: async (id, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  createBudget: async (budget, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.post(`${API_BASE_URL}/budgets`, budget, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  updateBudget: async (id, budget, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.put(`${API_BASE_URL}/budgets/${id}`, budget, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  deleteBudget: async (id, token) => {
    await userService.refreshToken();
    try {
      await axios.delete(`${API_BASE_URL}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

export default budgetService;