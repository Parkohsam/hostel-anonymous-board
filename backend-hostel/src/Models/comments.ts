import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
    content: string;
    postId: Types.ObjectId;
    authorId: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
}

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
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

commentSchema.index({ postId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);