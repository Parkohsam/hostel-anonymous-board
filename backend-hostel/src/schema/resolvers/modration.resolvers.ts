import { createGraphQLError } from "graphql-yoga";
import { Post } from "../../Models/post.ts";
import { Comment } from "../../Models/comments.ts";
import { User } from "../../Models/user.ts";
import type { MyContext } from "../../context/context.ts";

function requireAdmin(context: MyContext) {
    if (!context.user) {
        throw createGraphQLError("You must be logged in");
    }
    if (context.user.role !== "admin") {
        throw createGraphQLError("Admin access required");
    }
}

export const moderationResolvers = {
    Mutation: {
        deletePost: async (
            _parent: unknown,
            args: { postId: string },
            context: MyContext
        ) => {
            requireAdmin(context);

            const post = await Post.findById(args.postId);
            if (!post) {
                throw createGraphQLError("Post not found");
            }

            post.isDeleted = true;
            await post.save();

            return true;
        },

        deleteComment: async (
            _parent: unknown,
            args: { commentId: string },
            context: MyContext
        ) => {
            requireAdmin(context);

            const comment = await Comment.findById(args.commentId);
            if (!comment) {
                throw createGraphQLError("Comment not found");
            }

            comment.isDeleted = true;
            await comment.save();

            return true;
        },

        banUser: async (
            _parent: unknown,
            args: { userId: string },
            context: MyContext
        ) => {
            requireAdmin(context);

            const user = await User.findById(args.userId);
            if (!user) {
                throw createGraphQLError("User not found");
            }

            user.isBanned = true;
            await user.save();

            return true;
        },
    },
};