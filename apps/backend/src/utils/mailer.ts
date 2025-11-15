import nodemailer from 'nodemailer';
import { config } from '../config';
import { AppError } from './error';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) console.error('SMTP connection error:', err);
  else console.log('SMTP ready to send messages');
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Craftopia" <${config.email.user}>`,
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