import axios from 'axios';
import userService from './userService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const summaryService = {
  getSummary: async (token) => {
    await userService.refreshToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

export default summaryService;