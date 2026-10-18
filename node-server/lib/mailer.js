import nodemailer from 'nodemailer';

// Sends the sign-in OTP by email over SMTP. All settings come from the environment
// (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM) so no credential
// ever lives in the code. When SMTP_HOST is unset the mailer is "not configured" and the
// caller decides what to do (dev just logs; production refuses to pretend it sent).

export function smtpConfigured(env = process.env) {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export function createTransport(env = process.env) {
  const port = Number(env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    // 465 = implicit TLS; 587 = STARTTLS (secure must be false there).
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export function buildOtpMessage({ to, otp, purpose, expiresInMinutes = 5 }, env = process.env) {
  const action = purpose === 'login' ? 'sign in' : 'create your account';
  const from = env.SMTP_FROM || `JavaSchoolLab <${env.SMTP_USER}>`;
  return {
    from,
    to,
    subject: `${otp} is your JavaSchoolLab verification code`,
    text:
      `Your JavaSchoolLab verification code is ${otp}.\n\n` +
      `Use it to ${action}. It expires in ${expiresInMinutes} minutes.\n` +
      `If you did not request this, you can ignore this email.`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">` +
      `<h2 style="color:#ea580c;margin:0 0 12px">JavaSchoolLab</h2>` +
      `<p>Use this code to ${action}:</p>` +
      `<p style="font-size:32px;letter-spacing:6px;font-weight:bold;margin:16px 0">${otp}</p>` +
      `<p style="color:#555">It expires in ${expiresInMinutes} minutes. ` +
      `If you did not request this, you can ignore this email.</p></div>`,
  };
}

let cached;
export async function sendOtpEmail(args, env = process.env, transport) {
  const t = transport ?? (cached ??= createTransport(env));
  return t.sendMail(buildOtpMessage(args, env));
}
