import React, { useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MotiView } from 'moti';

import ErrorModal from 'components/modals/ErrorModal';
import RegisterFooter from 'components/auth/register/RegisterFooter';
import RegisterForm from 'components/auth/register/RegisterForm';
import RegisterHeader from 'components/auth/register/RegisterHeader';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (name: string, value: string) => {
    let message = '';
    switch (name) {
      case 'username':
        if (!value.trim()) message = 'Username is required.';
        break;
      case 'email':
        if (!value.trim()) message = 'Email is required.';
        else if (!isValidEmail(value)) message = 'Invalid email address.';
        break;
      case 'password':
        if (!value) message = 'Password is required.';
        else if (value.length < 8)
          message = 'Password must be at least 8 characters.';
        else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)
        )
          message =
            'Include uppercase, lowercase, number & special character.';
        break;
      case 'confirmPassword':
        if (!value) message = 'Please confirm your password.';
        else if (value !== form.password) message = "Passwords don't match.";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateAllFields = (): boolean => {
    const newErrors: ValidationErrors = {};

    for (const key of Object.keys(form)) {
      const value = form[key as keyof RegisterData];
      let message = '';

      switch (key) {
        case 'username':
          if (!value.trim()) message = 'Username is required.';
          break;
        case 'email':
          if (!value.trim()) message = 'Email is required.';
          else if (!isValidEmail(value)) message = 'Invalid email address.';
          break;
        case 'password':
          if (!value) message = 'Password is required.';
          else if (value.length < 8)
            message = 'Password must be at least 8 characters.';
          else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)
          )
            message = 'Include uppercase, lowercase, number & special character.';
          break;
        case 'confirmPassword':
          if (!value) message = 'Please confirm your password.';
          else if (value !== form.password) message = "Passwords don't match.";
          break;
      }

      if (message) newErrors[key as keyof ValidationErrors] = message;
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => !msg);
  };

  const showError = (message: string) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleRegister = async () => {
    const valid = validateAllFields();

    if (!valid) {
      showError('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { username, email, password } = form;

      const res = await axios.post(
        'http://192.168.1.9:3000/auth/register',
        { username, email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setLoading(false);
      navigation.navigate('Login' as never);

    } catch (err: any) {
      setLoading(false);
      showError(err.response?.data?.error || err.message || 'Registration failed');
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  return (
    <>
      <ErrorModal visible={!!error} message={error || ''} onClose={() => setError(null)} />

      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: isFocused ? 1 : 0, translateY: isFocused ? 0 : 30 }}
        transition={{ type: 'timing', duration: 500 }}
        className="flex-1 bg-cream px-6 pt-14 pb-8 justify-center"
        style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
      >
        <RegisterHeader />

        <MotiView
          animate={shake ? { translateX: [0, -10, 10, -10, 10, 0] } : { translateX: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          className=""
        >
          <RegisterForm
            form={form}
            focused={focused}
            setFocused={setFocused}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        </MotiView>

        <RegisterFooter
          onRegister={handleRegister}
          disabled={
            loading ||
            Object.values(errors).some((e) => e !== '') ||
            Object.values(form).some((v) => !v)
          }
          loading={loading}
        />
      </MotiView>
    </>
  );
};

export default Register;
