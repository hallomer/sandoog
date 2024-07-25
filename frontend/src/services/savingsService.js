import axios from 'axios';
import userService from './userService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const savingsService = {
  getAllSavings: async (token) => {
    await userService.refreshToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/savings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getSaving: async (id, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/savings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  createSaving: async (saving, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.post(`${API_BASE_URL}/savings`, saving, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  updateSaving: async (id, saving, token) => {
    await userService.refreshToken();
    try {
      const response = await axios.put(`${API_BASE_URL}/savings/${id}`, saving, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  deleteSaving: async (id, token) => {
    await userService.refreshToken();
    try {
      await axios.delete(`${API_BASE_URL}/savings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

export default savingsService;