import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.10/api'; // replace with your backend URL

export const postGoogleToken = async (idToken: string) => {
  const response = await axios.get(`${API_BASE_URL}/auth/google/`);
  return response.data;
};
