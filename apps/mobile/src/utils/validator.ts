// utils/validators.ts

/* ---------- LOGIN ---------- */
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email: string;
  password: string;
}

export const validateLogin = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = { email: '', password: '' };

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!values.password.trim()) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

/* ---------- REGISTER ---------- */
export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateRegister = (values: RegisterFormValues): RegisterFormErrors => {
  const errors: RegisterFormErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  if (!values.username.trim()) {
    errors.username = 'Username is required';
  } else if (values.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!values.password.trim()) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};
