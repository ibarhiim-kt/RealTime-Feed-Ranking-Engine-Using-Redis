import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
export const sendMagicLink = async (toEmail, link) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: toEmail,
    subject: 'Your Magic Login Link',
    html: `<p>Click <a href="${link}">here</a> to login. This link expires in 15 minutes.</p>`
  });
};

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}`;  

  await transporter.sendMail({
    from: `"Auth System" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Click the link below to verify:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `,
  });
};
