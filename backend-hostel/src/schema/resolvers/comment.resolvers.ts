import { z } from "zod";
import { createGraphQLError } from "graphql-yoga";
import { Comment } from "../../Models/comments.ts";
import { Post } from "../../Models/post.ts";
import { User } from "../../Models/user.ts";
import type { MyContext } from "../../context/context.ts";

const createCommentSchema = z.object({
    postId: z.string(),
    content: z.string().min(1).max(1000),
});

export const commentResolvers = {
    Query: {
        comments: async (_parent: unknown, args: { postId: string }) => {
            const comments = await Comment.find({
                postId: args.postId,
                isDeleted: false,
            }).sort({ createdAt: 1 });

            return Promise.all(
                comments.map(async (comment) => {
                    const author = await User.findById(comment.authorId);
                    return {
                        id: comment._id,
                        content: comment.content,
                        authorDisplayId: author?.displayId ?? "unknown",
                        createdAt: comment.createdAt.toISOString(),
                    };
                })
            );
        },
    },

    Mutation: {
        createComment: async (
            _parent: unknown,
            args: { postId: string; content: string },
            context: MyContext
        ) => {
            if (!context.user) {
                throw createGraphQLError("You must be logged in to comment");
            }

            const parsed = createCommentSchema.safeParse(args);
            if (!parsed.success) {
                throw createGraphQLError(
                    parsed.error.issues[0]?.message ?? "Invalid input"
                );
            }

            const post = await Post.findOne({
                _id: parsed.data.postId,
                isDeleted: false,
            });
            if (!post) {
                throw createGraphQLError("Post not found");
            }

            const author = await User.findById(context.user.userId);
            if (!author) {
                throw createGraphQLError("User not found");
            }
            if (author.isBanned) {
                throw createGraphQLError("This account has been banned");
            }

            const comment = await Comment.create({
                content: parsed.data.content,
                postId: post._id,
                authorId: author._id,
            });

            return {
                id: comment._id,
                content: comment.content,
                authorDisplayId: author.displayId,
                createdAt: comment.createdAt.toISOString(),
            };
        },
    },
};