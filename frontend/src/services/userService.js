import axios from 'axios';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const userService = {
  checkUser: async (username) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/check_user`, { username });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      const { user, access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('is_guest', 'false');
      return { ...user, token: access_token };
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  register: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { username, password });
      const { user, access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('is_guest', 'false');
      return { ...user, token: access_token };
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  guestSession: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/guest_session`);
      const { user, access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('is_guest', 'true');
      return { ...user, token: access_token };
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  refreshToken: async () => {
    const is_guest = localStorage.getItem('is_guest') === 'true';
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
  
    if (is_guest) {
      if (!access_token) {
        return <Navigate to="/user" replace />;
      }
      return access_token;
    }
    if (!refresh_token) {
      return <Navigate to="/user" replace />;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/refresh`, {}, {
        headers: { Authorization: `Bearer ${refresh_token}` }
      });
      const { access_token: newAccessToken, is_guest: responseIsGuest } = response.data;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      return <Navigate to="/user" replace />;
    }
  }
};

export default userService;