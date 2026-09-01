import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isSmtpConfigured = !!(env.SMTP_USER && env.SMTP_PASS);

function createTransporter() {
  if (!isSmtpConfigured) return null;

  // If host is explicitly specified or standard SMTP
  if (env.SMTP_HOST && env.SMTP_HOST !== 'smtp.gmail.com') {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Gmail SMTP default
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

const transporter = createTransporter();

export const emailService = {
  async sendVerificationEmail(toEmail, token, userName = 'Team Member') {
    if (!transporter) {
      console.warn('⚠️ SMTP not configured — skipping verification email');
      return { skipped: true };
    }

    const verifyUrl = `${env.APP_BASE_URL}/#verify?token=${token}`;
    const subject = "Verify your Lakshya Portal Account";
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #1F3864; color: #ffffff; padding: 28px 32px; text-align: center; }
          .badge { display: inline-block; background: #2F5597; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; }
          .title { font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
          .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #334155; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #1F3864; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 6px; }
          .alt-link { word-break: break-all; font-size: 12px; color: #2563eb; }
          .divider { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
          .footer { padding: 16px 32px 24px; font-size: 12px; color: #64748b; text-align: center; background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">LAKSHYA</div>
            <h1 class="title">Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Thank you for registering on the <strong>Lakshya Stage-Gate Innovation Portal</strong>. To activate your account and gain access to the innovation pipeline, please confirm your email address.</p>
            
            <div class="btn-container">
              <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
            </div>

            <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this link into your browser:</p>
            <p><a href="${verifyUrl}" class="alt-link">${verifyUrl}</a></p>

            <hr class="divider" />
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">This verification link will expire in 24 hours. If you did not create this account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Lakshya Innovation & Operational Excellence System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"Lakshya Portal" <${env.SMTP_FROM || env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`✅ Verification email sent to ${toEmail}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send verification email to ${toEmail}:`, error);
      throw error;
    }
  },

  async sendPasswordResetEmail(toEmail, token, userName = 'User') {
    if (!transporter) {
      console.warn('⚠️ SMTP not configured — skipping password reset email');
      return { skipped: true };
    }

    const resetUrl = `${env.APP_BASE_URL}/#reset-password?token=${token}`;
    const subject = "Reset your Lakshya Portal Password";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #1F3864; color: #ffffff; padding: 28px 32px; text-align: center; }
          .badge { display: inline-block; background: #2F5597; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; }
          .title { font-size: 20px; font-weight: 700; margin: 0; }
          .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #334155; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #1F3864; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 6px; }
          .alt-link { word-break: break-all; font-size: 12px; color: #2563eb; }
          .divider { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
          .footer { padding: 16px 32px 24px; font-size: 12px; color: #64748b; text-align: center; background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">LAKSHYA</div>
            <h1 class="title">Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password for the <strong>Lakshya Stage-Gate Innovation Portal</strong>. Click the button below to choose a new password:</p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>

            <p style="font-size: 13px; color: #64748b;">Or paste this link into your browser:</p>
            <p><a href="${resetUrl}" class="alt-link">${resetUrl}</a></p>

            <hr class="divider" />
            <p style="font-size: 12px; color: #94a3b8;">This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Lakshya Innovation & Operational Excellence System.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"Lakshya Portal" <${env.SMTP_FROM || env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`✅ Password reset email sent to ${toEmail}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send password reset email to ${toEmail}:`, error);
      throw error;
    }
  },

  async sendStageChangeEmail(toEmail, projectTitle, fromStage, toStage) {
    if (!transporter) {
      console.warn('⚠️ SMTP not configured — skipping stage change email');
      return { skipped: true };
    }

    const subject = `Lakshya Update: ${projectTitle} moved to ${toStage}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          .header { background: #1F3864; color: #ffffff; padding: 24px; text-align: center; }
          .content { padding: 28px; font-size: 14px; line-height: 1.6; }
          .stage-pill { display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-weight: 700; font-size: 16px; padding: 8px 16px; border-radius: 6px; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;font-size:18px;">Lakshya Innovation Portal</h2>
          </div>
          <div class="content">
            <p>An initiative has been advanced through the stage gate:</p>
            <h3 style="color:#1F3864;margin:8px 0;">${projectTitle}</h3>
            <div class="stage-pill">
              ${fromStage} &rarr; ${toStage}
            </div>
            <p style="color:#64748b;font-size:12px;margin-top:20px;">Lakshya Innovation System — Automated Pipeline Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"Lakshya Portal" <${env.SMTP_FROM || env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`✅ Stage change email sent to ${toEmail}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send stage change email to ${toEmail}:`, error);
      return null;
    }
  }
};
