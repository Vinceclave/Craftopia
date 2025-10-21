import Joi from 'joi';
import { commonSchemas } from '../utils/validation';

export const registerSchema = Joi.object({
  username: commonSchemas.username,
  email: commonSchemas.email,
  password: commonSchemas.password
});

export const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: commonSchemas.requiredString(1, 500)
});

export const resendVerificationSchema = Joi.object({
  email: commonSchemas.email
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: commonSchemas.password
});

export const forgotPasswordSchema = Joi.object({
  email: commonSchemas.email
});

export const resetPasswordSchema = Joi.object({
  token: commonSchemas.requiredString(1, 500),
  newPassword: commonSchemas.password
});