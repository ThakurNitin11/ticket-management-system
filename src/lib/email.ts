import nodemailer from 'nodemailer';

export function getMailTransporter() {
  const user = process.env.SMTP_USER?.replace(/["'\s]/g, '').trim();
  const pass = process.env.SMTP_PASS?.replace(/["'\s]/g, '').trim();

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS are required in .env');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user,
      pass,
    },
  });
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyToMessageId?: string;
  references?: string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail(options: SendEmailOptions) {
  const user = process.env.SMTP_USER?.replace(/["'\s]/g, '').trim();

  if (!user) {
    throw new Error('SMTP_USER is required in .env');
  }

  const transporter = getMailTransporter();

  const headers: Record<string, string | string[]> = {};

  if (options.replyToMessageId) {
    headers['In-Reply-To'] = options.replyToMessageId;
  }

  if (options.references && options.references.length > 0) {
    headers['References'] = options.references;
  }

  const info = await transporter.sendMail({
    from: `"HelpDesk Support" <${user}>`,
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    text: options.text,
    html: options.html,
    headers,
    attachments: options.attachments,
  });

  return info.messageId;
}
