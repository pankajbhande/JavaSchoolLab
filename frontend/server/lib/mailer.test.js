import { describe, it, expect } from 'vitest';
import nodemailer from 'nodemailer';
import { smtpConfigured, buildOtpMessage, sendOtpEmail } from './mailer.js';

const env = { SMTP_HOST: 'smtp.example.com', SMTP_USER: 'info@example.com', SMTP_PASS: 'x' };

describe('smtpConfigured', () => {
  it('needs host, user and password', () => {
    expect(smtpConfigured(env)).toBe(true);
    expect(smtpConfigured({ ...env, SMTP_PASS: '' })).toBe(false);
    expect(smtpConfigured({})).toBe(false);
  });
});

describe('buildOtpMessage', () => {
  it('puts the code in subject, text and html and defaults the sender', () => {
    const m = buildOtpMessage({ to: 'a@b.com', otp: '123456', purpose: 'register' }, env);
    expect(m.to).toBe('a@b.com');
    expect(m.from).toBe('JavaSchoolLab <info@example.com>');
    expect(m.subject).toContain('123456');
    expect(m.text).toContain('create your account');
    expect(m.html).toContain('123456');
  });
  it('uses SMTP_FROM and the login wording', () => {
    const m = buildOtpMessage({ to: 'a@b.com', otp: '654321', purpose: 'login' }, { ...env, SMTP_FROM: 'Me <me@x.com>' });
    expect(m.from).toBe('Me <me@x.com>');
    expect(m.text).toContain('sign in');
  });
});

describe('sendOtpEmail', () => {
  it('hands the message to the transport', async () => {
    const transport = nodemailer.createTransport({ jsonTransport: true });
    const info = await sendOtpEmail({ to: 'a@b.com', otp: '111222', purpose: 'login' }, env, transport);
    expect(JSON.parse(info.message).subject).toContain('111222');
  });
});
