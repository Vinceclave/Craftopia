export function verificationEmailTemplate(username: string, verificationUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Thank you for signing up! Please click the link below to verify your email:</p>
      <a href="${verificationUrl}" style="display:inline-block; margin-top:10px; background:#2563eb; color:#fff; padding:10px 15px; border-radius:6px; text-decoration:none;">
        Verify Email
      </a>
      <p style="font-size:12px; color:#555;">If you didn’t request this, you can safely ignore this email.</p>
    </div>
  `;
}
