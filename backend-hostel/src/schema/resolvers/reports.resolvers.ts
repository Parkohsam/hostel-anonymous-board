import { z } from "zod";
import { createGraphQLError } from "graphql-yoga";
import { Report } from "../../Models/reports.ts";
import { Post } from "../../Models/post.ts";
import { Comment } from "../../Models/comments.ts";
import type { MyContext } from "../../context/context.ts";

function requireAdmin(context: MyContext) {
    if (!context.user) {
        throw createGraphQLError("You must be logged in");
    }
    if (context.user.role !== "admin") {
        throw createGraphQLError("Admin access required");
    }
}

const reportSchema = z.object({
    targetType: z.enum(["post", "comment"]),
    targetId: z.string(),
    reason: z.string().min(1).max(300),
});

export const reportResolvers = {
    Query: {
        reports: async (_parent: unknown, _args: unknown, context: MyContext) => {
            requireAdmin(context);

            const reports = await Report.find({ status: "pending" }).sort({
                createdAt: -1,
            });

            return reports.map((report) => ({
                id: report._id,
                targetType: report.targetType,
                targetId: report.targetId.toString(),
                reason: report.reason,
                status: report.status,
                createdAt: report.createdAt.toISOString(),
            }));
        },
    },

    Mutation: {
        reportContent: async (
            _parent: unknown,
            args: { targetType: "post" | "comment"; targetId: string; reason: string },
            context: MyContext
        ) => {
            if (!context.user) {
                throw createGraphQLError("You must be logged in to report content");
            }

            const parsed = reportSchema.safeParse(args);
            if (!parsed.success) {
                throw createGraphQLError(
                    parsed.error.issues[0]?.message ?? "Invalid input"
                );
            }

            const { targetType, targetId, reason } = parsed.data;

            const target =
                targetType === "post"
                    ? await Post.findById(targetId)
                    : await Comment.findById(targetId);

            if (!target) {
                throw createGraphQLError(`${targetType} not found`);
            }

            const report = await Report.create({
                targetType,
                targetId,
                reporterId: context.user.userId,
                reason,
            });

            return {
                id: report._id,
                targetType: report.targetType,
                targetId: report.targetId.toString(),
                reason: report.reason,
                status: report.status,
                createdAt: report.createdAt.toISOString(),
            };
        },
    },
};