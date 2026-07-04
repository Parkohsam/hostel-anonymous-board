import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  content: string;
  authorId: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
}

const POST_LIFESPAN_SECONDS = 86400; // 24 hours for testing — change to 86400 for 24 hours

const postSchema = new Schema<IPost>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ createdAt: -1 });
postSchema.index({ createdAt: 1 }, { expireAfterSeconds: POST_LIFESPAN_SECONDS });

export const Post = mongoose.model<IPost>("Post", postSchema);