import { transporter } from "@/utils/emailTransporter";
import { verificationEmailTemplate } from "@/utils/template/VerifyEmail";

export async function sendVerificationEmail(to: string, username: string, token: string) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";
  const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Craftopia" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your Craftopia account",
    html: verificationEmailTemplate(username, verificationUrl),
  });
}
