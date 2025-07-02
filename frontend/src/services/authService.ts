import api from '@/lib/axios';
import { AuthResponse, User } from '@/types';
import { API_BASE_URL } from '@/config';

export const authService = {
  signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post(`${API_BASE_URL}/auth/signup`, {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    const response = await api.post(`${API_BASE_URL}/auth/login`, {
      username: usernameOrEmail,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/request-reset', null, {
      params: { email },
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },


  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },
};
