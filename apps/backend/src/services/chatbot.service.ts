import prisma from "../config/prisma";
import { AppError } from "../utils/error";
import { MessageSender } from "../generated/prisma";

export const createChatConverstaion = async (data: {
    user_id: number;
    title?: string;
}) => {
    if (!data.user_id) throw new AppError('User ID is required', 400);

    return prisma.chatbotConversation.create({
        data: {
            user_id: data.user_id,
            title: data.title?.trim() || 'New Conversation'
        },
    });
}

export const createChatMessage = async (data: {
    conversation_id: number;
    sender: MessageSender;
    content: string;
}) => {
    if (data.content?.trim().length === 0) 
        throw new AppError('Message content cannot be empty', 400);

    return prisma.chatbotMessage.create({
        data: {
            conversation_id: data.conversation_id,
            sender: data.sender,
            content: data.content.trim()
        }
    })
}