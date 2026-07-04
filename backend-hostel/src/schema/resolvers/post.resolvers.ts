import { z } from "zod";
import { createGraphQLError } from "graphql-yoga";
import { Post } from "../../Models/post.ts";
import { User } from "../../Models/user.ts";
import type { MyContext } from "../../context/context.ts";

const createPostSchema = z.object({
    content: z.string().min(1).max(2000),
});

export const postResolvers = {
    Query: {
        posts: async () => {
            const posts = await Post.find({ isDeleted: false })
                .sort({ createdAt: -1 })
                .limit(50);

            return Promise.all(
                posts.map(async (post) => {
                    const author = await User.findById(post.authorId);
                    return {
                        id: post._id,
                        content: post.content,
                        authorDisplayId: author?.displayId ?? "unknown",
                        createdAt: post.createdAt.toISOString(),
                    };
                })
            );
        },

        post: async (_parent: unknown, args: { id: string }) => {
            const post = await Post.findOne({ _id: args.id, isDeleted: false });
            if (!post) {
                throw createGraphQLError("Post not found");
            }

            const author = await User.findById(post.authorId);

            return {
                id: post._id,
                content: post.content,
                authorDisplayId: author?.displayId ?? "unknown",
                createdAt: post.createdAt.toISOString(),
            };
        },
    },

    Mutation: {
        createPost: async (
            _parent: unknown,
            args: { content: string },
            context: MyContext
        ) => {
            if (!context.user) {
                throw createGraphQLError("You must be logged in to post");
            }

            const parsed = createPostSchema.safeParse(args);
            if (!parsed.success) {
                throw createGraphQLError(
                    parsed.error.issues[0]?.message ?? "Invalid input"
                );
            }

            const author = await User.findById(context.user.userId);
            if (!author) {
                throw createGraphQLError("User not found");
            }
            if (author.isBanned) {
                throw createGraphQLError("This account has been banned");
            }

            const post = await Post.create({
                content: parsed.data.content,
                authorId: author._id,
            });

            return {
                id: post._id,
                content: post.content,
                authorDisplayId: author.displayId,
                createdAt: post.createdAt.toISOString(),
            };
        },
    },
};