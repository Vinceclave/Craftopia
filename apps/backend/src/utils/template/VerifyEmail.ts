// apps/backend/src/utils/template/VerifyEmail.ts
export function verificationEmailTemplate(username: string, verificationUrl: string) {
  // Extract token from URL
  const token = verificationUrl.split('token=')[1];
  
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Email Verification</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <h3 style="color: #374151; margin-top: 0;">📱 For Mobile App Users:</h3>
        <p>Copy this verification token and paste it in the app:</p>
        <div style="background: white; padding: 15px; border-radius: 6px; font-family: monospace; word-break: break-all; border: 2px dashed #2563eb;">
          <strong>${token}</strong>
        </div>
      </div>

      <p style="font-size:12px; color:#6b7280; margin-top: 30px;">
        If you didn't request this verification, you can safely ignore this email.<br>
        This verification link will expire in 24 hours.
      </p>
    </div>
  `;
}