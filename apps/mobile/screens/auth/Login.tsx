import React, { useState, useContext } from 'react';
import { MotiView } from 'moti';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from 'contexts/AuthContext';

import LoginHeader from 'components/auth/login/LoginHeader';
import LoginForm from 'components/auth/login/LoginForm';
import LoginFooter from 'components/auth/login/LoginFooter';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useContext(AuthContext);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [form, setForm] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (name: keyof FormData, value: string) => {
    let message = '';
    if (!value.trim()) {
      message = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === 'email' && !isValidEmail(value)) {
      message = 'Invalid email address.';
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleFieldChange = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const isFormValid = () =>
    form.email.trim() !== '' &&
    form.password.trim() !== '' &&
    isValidEmail(form.email) &&
    Object.values(errors).every((e) => !e);

  const handleLogin = async () => {
    validateField('email', form.email);
    validateField('password', form.password);

    if (!isFormValid()) return;

    setLoading(true);

    try {
      const { email, password } = form;

      const res = await axios.post(
        'http://192.168.1.8:3000/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = res.data.token;
      
      await login(token)
      console.log('Token stored successfully');

      setLoading(false);

      // Optionally navigate after successful login
      navigation.navigate('Home' as never);
    } catch (err: any) {
      setLoading(false);
      const message = err.response?.data?.error || err.message || 'Login failed';
      alert(message);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: isFocused ? 1 : 0, translateY: isFocused ? 0 : 30 }}
      transition={{ type: 'timing', duration: 500 }}
      className="flex-1 bg-cream px-8 pt-20 pb-10 justify-center"
    >
      <LoginHeader />
      <LoginForm form={form} errors={errors} onFieldChange={handleFieldChange} />
      <LoginFooter
        onLogin={handleLogin}
        loading={loading}
        disabled={!isFormValid()}
        onNavigateRegister={() => navigation.navigate('Register' as never)}
      />
    </MotiView>
  );
};

export default Login;
