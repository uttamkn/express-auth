import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const VerificationSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  verificationCode: { type: String, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  verificationCodeExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiresAt: Date,
});

export const VerificationModel = mongoose.model(
  "VerificationModel",
  VerificationSchema,
);

export default mongoose.model<IUser>("UserModel", UserSchema);
