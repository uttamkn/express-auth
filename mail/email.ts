import nodemailer from "nodemailer";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplate";
import { GMAIL_PASSWORD, GMAIL_USER } from "../env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
});

export const sendOtp = async (email: string, code: string) => {
  const mailOptions = {
    from: GMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", code),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to: ", email);
  } catch (error) {
    console.error("Error sending verification email: ", error);
    throw new Error("Error sending verification email");
  }
};

export const sendPasswordResetEmail = async (email: string, url: string) => {
  const mailOptions = {
    from: GMAIL_USER,
    to: email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", url),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to: ", email);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
    throw new Error("Error sending password reset email");
  }
};
