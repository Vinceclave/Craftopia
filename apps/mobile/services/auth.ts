import api from './api'; // your axios instance

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string; // optional if backend needs it
}

export const registerUser = async (data: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Registration failed');
  }
};
