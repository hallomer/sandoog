import axios from 'axios';
import userService from './userService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const transactionService = {
  getAllTransactions: async (token) => {
    await userService.refreshToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  addTransaction: async (transaction, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions`, transaction, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  deleteTransaction: async (id, token) => {
    await userService.refreshToken();
    try {
      await axios.delete(`${API_BASE_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

export default transactionService;