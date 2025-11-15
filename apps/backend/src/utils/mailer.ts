import nodemailer from 'nodemailer';
import { config } from '../config';
import { AppError } from './error';
import { logger } from './logger';

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

// Verify connection on startup with better logging
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info('✅ SMTP connection verified - Ready to send emails', {
      host: config.email.host,
      port: config.email.port,
      user: config.email.user ? `${config.email.user.substring(0, 3)}***` : 'not configured'
    });
    console.log('✅ SMTP ready to send messages');
  } catch (err: any) {
    logger.error('❌ SMTP connection failed', err, {
      host: config.email.host,
      port: config.email.port,
      message: err.message
    });
    console.error('❌ SMTP connection error:', err.message);
    console.error('⚠️  Email features will not work until SMTP is properly configured');
  }
};

// Call verification
verifyEmailConnection();

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