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
    errors.email = 'Please enter your email';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Enter a valid email';
  }

  if (!values.password.trim()) {
    errors.password = 'Please enter your password';
  } else if (values.password.length < 6) {
    errors.password = 'At least 6 characters';
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
    errors.username = 'Choose a username';
  } else if (values.username.length < 3) {
    errors.username = 'At least 3 characters';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Enter a valid email';
  }

  if (!values.password.trim()) {
    errors.password = 'Create a password';
  } else if (values.password.length < 6) {
    errors.password = 'At least 6 characters';
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords don’t match';
  }

  return errors;
};

/* ---------- FORGOT PASSWORD ---------- */
export interface ForgotPasswordFormValues {
  email: string;
  token: string;
  password: string;
}

export interface ForgotPasswordFormErrors {
  email: string;
  token: string;
  password: string;
}

export const validateForgotPassword = (
  values: ForgotPasswordFormValues,
  step: 'email' | 'token' | 'password'
): ForgotPasswordFormErrors => {
  const errors: ForgotPasswordFormErrors = { email: '', token: '', password: '' };

  if (step === 'email') {
    if (!values.email.trim()) {
      errors.email = 'Please enter your email';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Enter a valid email';
    }
  }

  if (step === 'token') {
    if (!values.token.trim()) {
      errors.token = 'Enter the token';
    } else if (values.token.length < 4) {
      errors.token = 'At least 4 characters';
    }
  }

  if (step === 'password') {
    if (!values.password.trim()) {
      errors.password = 'Create a new password';
    } else if (values.password.length < 6) {
      errors.password = 'At least 6 characters';
    }
  }

  return errors;
};
