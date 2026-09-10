import nodemailer from "nodemailer";

const sentEmails = [];
const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
const transporter = smtpConfigured ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
}) : null;

export async function sendEnrollmentEmail({ to, seekerName, courseName, status, jobTitle, company }) {
  const subject = status === "Accepted"
    ? `Your enrollment was accepted: ${courseName}`
    : `Your enrollment was updated: ${courseName}`;
  const text = status === "Accepted"
    ? `Hello ${seekerName},\n\nYour enrollment for ${courseName} has been accepted by ${company} for the ${jobTitle} application.\n\nYou are now enrolled in the course.\n\nRegards,\nSmartRecruit Team`
    : `Hello ${seekerName},\n\nYour enrollment status for ${courseName} is now ${status}.\n\nRegards,\nSmartRecruit Team`;
  const message = { to, subject, text, status: "queued", createdAt: new Date().toISOString() };
  sentEmails.push(message);
  if (!transporter) {
    console.log(`[email:dev] ${to} | ${subject}`);
    return { ...message, mode: "development" };
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
  return { ...message, status: "sent", mode: "smtp" };
}

export function getSentEmails() {
  return sentEmails;
}
