import { type Request, type Response } from "express";
import UserModel, { VerificationModel, type IUser } from "../models/User";
import bcrypt from "bcryptjs";
import { signJwt, sendErrorResponse } from "../utils";
import { sendOtp, sendPasswordResetEmail } from "../mail/email";
import crypto from "crypto";

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const generateResetPasswordToken = () => crypto.randomBytes(20).toString("hex");
const tokenExpiry = (minutes: number) => Date.now() + minutes * 60 * 1000;

// /api/auth/send-email-verification
export const sendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendErrorResponse(res, 400, "Email is required");
  }

  try {
    const verificationCode = generateVerificationCode();
    const expiryTime = tokenExpiry(15);

    const verificationData = await VerificationModel.findOneAndUpdate(
      { email },
      { verificationCode, verificationCodeExpiresAt: expiryTime },
      { upsert: true, new: true },
    );

    await sendOtp(email, verificationCode);
    await verificationData.save();

    res.status(201).json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Error sending email verification:", err);
    sendErrorResponse(res, 500, "Internal server error");
  }
};

// /api/auth/sign-up
export const signUp = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    sendErrorResponse(res, 400, "Required fields: username, password, email");
    return;
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    const pendingVerification = await VerificationModel.findOne({ email });

    if (existingUser) {
      sendErrorResponse(res, 400, "Email already exists");
      return;
    }

    if (pendingVerification) {
      sendErrorResponse(
        res,
        400,
        "Verification already pending. Check your email.",
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verification = new VerificationModel({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    await verification.save();

    // Send verification email
    await sendOtp(email, verificationCode);

    res.status(201).json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Error creating user: ", err);
    sendErrorResponse(res, 500, "Internal server error");
  }
};

// /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    sendErrorResponse(res, 400, "Verification code is required");
    return;
  }

  try {
    const verification = await VerificationModel.findOneAndDelete({
      verificationCode,
      verificationCodeExpiresAt: { $gt: Date.now() },
    });

    if (!verification) {
      sendErrorResponse(res, 400, "Invalid or expired verification code");
      return;
    }

    // Move data from verification collection to the main user collection
    const newUser: IUser = new UserModel({
      username: verification.username,
      email: verification.email,
      password: verification.password,
    });

    await newUser.save();

    res.status(200).json({ message: "Email verified and account created" });
  } catch (err) {
    console.error("Error verifying email: ", err);
    sendErrorResponse(res, 500, "Internal server error");
  }
};

// /api/auth/forgot-password
export const handleForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    sendErrorResponse(res, 400, "Email is required");
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      sendErrorResponse(res, 400, "User not found");
      return;
    }

    const resetPasswordToken = generateResetPasswordToken();
    const resetPasswordTokenExpiresAt = tokenExpiry(60);

    await VerificationModel.findOneAndUpdate(
      { email },
      { resetPasswordToken, resetPasswordTokenExpiresAt },
      { upsert: true },
    );

    await sendPasswordResetEmail(
      email,
      `${process.env.CLIENT_URL}/sign-in/reset-password/${resetPasswordToken}`,
    );

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Error sending password reset email:", err);
    sendErrorResponse(res, 500, "Internal server error");
  }
};

// /api/auth/reset-password/:token
export const handleResetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    sendErrorResponse(res, 400, "Password is required");
    return;
  }

  try {
    const verification = await VerificationModel.findOneAndDelete({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });

    if (!verification) {
      sendErrorResponse(res, 400, "Invalid or expired token");
      return;
    }

    const user = await UserModel.findOne({ email: verification.email });

    if (!user) {
      sendErrorResponse(res, 400, "User not found");
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    console.error("Error resetting password:", err);
    sendErrorResponse(res, 500, "Internal server error");
  }
};

// /api/auth/sign-in
export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendErrorResponse(res, 400, "Required fields: email, password");
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      sendErrorResponse(res, 401, "Invalid email or password");
      return;
    }

    const token = signJwt(user.email);
    res.status(200).json({ token });
  } catch (err) {
    console.error("Error signing in user:", err);
    sendErrorResponse(res, 500, "Internal server error");
  }
};
