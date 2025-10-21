import Joi from 'joi';
import { commonSchemas } from '../utils/validation';

export const chatMessageSchema = Joi.object({
  message: commonSchemas.requiredString(1, 2000)
});

export const createConversationSchema = Joi.object({
  user_id: commonSchemas.positiveId
});

export const createChatMessageSchema = Joi.object({
  conversation_id: commonSchemas.positiveId,
  sender: commonSchemas.enum(['user', 'ai']),
  content: commonSchemas.requiredString(1, 5000)
});