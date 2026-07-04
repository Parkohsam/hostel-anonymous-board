import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReport extends Document {
    targetType: "post" | "comment";
    targetId: Types.ObjectId;
    reporterId: Types.ObjectId;
    reason: string;
    status: "pending" | "reviewed";
    createdAt: Date;
}

const reportSchema = new Schema<IReport>({
    targetType: {
        type: String,
        enum: ["post", "comment"],
        required: true,
    },
    targetId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    reporterId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300,
    },
    status: {
        type: String,
        enum: ["pending", "reviewed"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Report = mongoose.model<IReport>("Report", reportSchema);