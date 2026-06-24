import { Resend } from "resend";

const config = useRuntimeConfig();
const resendApiKey = config.resendApiKey as string | undefined;

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!resendApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Resend API key not configured",
      });
    }
    resend = new Resend(resendApiKey);
  }
  return resend;
}

const appUrl = (config.public?.appUrl as string) || "http://localhost:3000";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function send(options: SendEmailOptions) {
  console.log(`[email] Sending email to ${options.to}: ${options.subject}`);

  if (!resendApiKey) {
    console.log(`[email] No RESEND_API_KEY configured. Email not sent.
To: ${[options.to]}
Subject: ${options.subject}
Body: ${options.html}`);
    return;
  }

  try {
    const sendEmail = await getResend().emails.send({
      from: "QuickNotes <onboarding@resend.dev>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (sendEmail.error) {
      console.error(`[email] Resend error:`, sendEmail.error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send email: ${sendEmail.error.message}`,
      });
    }

    console.log(`[email] Sent successfully to ${options.to}`);
  } catch (err) {
    console.error(`[email] Failed to send to ${options.to}:`, err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send email",
    });
  }
}

export function buildVerificationEmailHtml(token: string): string {
  const link = `${appUrl}/auth/verify-email?token=${token}`;
  return `
    <h1>Verify your email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${link}">${link}</a>
    <p>This link expires in 1 hour.</p>
  `;
}

export function buildPasswordResetEmailHtml(token: string): string {
  const link = `${appUrl}/auth/reset-password?token=${token}`;
  return `
    <h1>Reset your password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${link}">${link}</a>
    <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `;
}

export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<void> {
  await send({
    to,
    subject: "Verify your QuickNotes email",
    html: buildVerificationEmailHtml(token),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  await send({
    to,
    subject: "Reset your QuickNotes password",
    html: buildPasswordResetEmailHtml(token),
  });
}
