import mongoose, { Schema, Document } from "mongoose";
import { customAlphabet } from "nanoid";

const generateDisplayId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  8
);

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayId: string;
  role: "user" | "admin";
  isBanned: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  displayId: {
    type: String,
    required: true,
    unique: true,
    default: () => generateDisplayId(),
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>("User", userSchema);