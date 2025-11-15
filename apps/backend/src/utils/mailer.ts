import nodemailer from 'nodemailer';
import { AppError } from './error';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection at startup
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP connection error:', err);
  } else {
    console.log('SMTP ready to send messages');
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Error sending email:', err);
    throw new AppError('Failed to send email', 500);
  }
};
