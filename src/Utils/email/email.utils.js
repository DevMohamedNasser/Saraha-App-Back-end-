import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASS } from "../../../Config/config.service.js";

export async function sendEmail({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  attachments,
}) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Saraha App" <${USER_EMAIL}>`,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
      // html:
    });

    console.log(`email has been sent ${info.messageId}`);
  } catch (error) {
    console.log(`Error sending email: ${error.message}`);
  }
}

export const emailSubject = {
  confirmEmail: "Confirm Email",
  resetPassword: "Reset ur password",
  welcome: "Welcome",
  contactUs: "Contact us",
};
