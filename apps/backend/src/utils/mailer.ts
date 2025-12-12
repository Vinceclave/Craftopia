import nodemailer from 'nodemailer';
import { config } from '../config';

// Trim whitespace/newlines from SMTP credentials (env parsing issue fix)
const smtpUser = config.email.user?.trim() || '';
const smtpPass = config.email.pass?.trim() || '';

console.log('📧 SMTP Configuration:', {
  host: config.email.host,
  port: config.email.port,
  user: smtpUser ? `${smtpUser.substring(0, 10)}...` : 'NOT SET',
  pass: smtpPass ? 'SET (length: ' + smtpPass.length + ')' : 'NOT SET'
});

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP connection FAILED:', err.message);
    console.error('   Full error:', err);
  } else {
    console.log('✅ SMTP ready to send messages');
  }
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  // Pre-flight check for configuration
  if (!smtpUser || !smtpPass) {
    console.error('📧 Email not sent: SMTP credentials not configured');
    console.error('Please set SMTP_USER and SMTP_PASS in your .env file');
    return { success: false, error: 'SMTP credentials not configured' };
  }

  const fromAddress = `"Craftopia" <${smtpUser}>`;
  console.log('📧 Attempting to send email:', {
    from: fromAddress,
    to: to.trim(),
    subject
  });

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: to.trim(),
      subject,
      html,
    });
    console.log('📧 ✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('📧 ❌ Error sending email:', {
      error: err.message || err,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
      to: to.trim(),
      subject
    });
    return { success: false, error: err.message || 'Failed to send email' };
  }
};
