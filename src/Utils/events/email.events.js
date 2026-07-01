import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../email/email.utils.js";
import { template } from "../email/generateHTML.js";

export const emailEvents = new EventEmitter();

emailEvents.on("confirmEmail", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubject.confirmEmail,
      html: template(data.otp, data.userName, emailSubject.confirmEmail),
    });
  } catch (error) {
    console.log(`Error sending email: ${error.message}`);
  }
});

emailEvents.on("forgetPassword", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubject.resetPassword,
      html: template(data.otp, data.userName, emailSubject.resetPassword),
    });
  } catch (error) {
    console.log(`Error sending email: ${error.message}`);
  }
});
