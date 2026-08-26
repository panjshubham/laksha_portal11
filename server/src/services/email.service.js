import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isSmtpConfigured = !!(env.SMTP_USER && env.SMTP_PASS);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        // Required in some Node environments where the root CA chain is incomplete
        rejectUnauthorized: false,
      },
    })
  : null;

export const emailService = {
  async sendStageChangeEmail(toEmail, projectTitle, fromStage, toStage) {
    if (!transporter) { console.warn('SMTP not configured — skipping email'); return; }
    const subject = `Lakshya Update: ${projectTitle} moved to ${toStage}`;
    const html = `
      <h2 style="color:#1e40af">Lakshya Innovation Portal</h2>
      <p>The project <strong>${projectTitle}</strong> has been advanced:</p>
      <p style="font-size:18px"><strong>${fromStage}</strong> → <strong>${toStage}</strong></p>
      <hr/>
      <p style="color:#6b7280;font-size:12px">Lakshya Innovation System — automated notification</p>
    `;
    return transporter.sendMail({
      from: `"Lakshya Portal" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject,
      html,
    }).then(info => {
      console.log(`✅ Email sent to ${toEmail}: ${info.messageId}`);
      return info;
    });
  },

  async sendVerificationEmail(toEmail, token) {
    if (!transporter) { console.warn('SMTP not configured — skipping email'); return; }
    const link = `${env.APP_BASE_URL}/verify?token=${token}`;
    return transporter.sendMail({
      from: `"Lakshya Portal" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject: "Verify your Lakshya account",
      html: `<p>Click the link to verify your email: <a href="${link}">${link}</a></p>`,
    });
  },

  async sendPasswordResetEmail(toEmail, token) {
    if (!transporter) { console.warn('SMTP not configured — skipping email'); return; }
    const link = `${env.APP_BASE_URL}/reset-password?token=${token}`;
    return transporter.sendMail({
      from: `"Lakshya Portal" <${env.SMTP_FROM}>`,
      to: toEmail,
      subject: "Lakshya Password Reset",
      html: `<p>Click the link to reset your password: <a href="${link}">${link}</a></p>`,
    });
  }
};
