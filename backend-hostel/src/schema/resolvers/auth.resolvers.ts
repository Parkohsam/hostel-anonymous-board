import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createGraphQLError } from "graphql-yoga";
import { User } from "../../Models/user.ts";
import type { MyContext } from "../../context/context.ts";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const authResolvers = {
    Query: {
        me: async (_parent: unknown, _args: unknown, context: MyContext) => {
            if (!context.user) {
                return null;
            }

            const user = await User.findById(context.user.userId);
            if (!user) {
                return null;
            }

            return {
                displayId: user.displayId,
                role: user.role,
            };
        },
    },

    Mutation: {
        register: async (
            _parent: unknown,
            args: { email: string; password: string }
        ) => {
            const parsed = registerSchema.safeParse(args);
            if (!parsed.success) {
                throw createGraphQLError(
                    parsed.error.issues[0]?.message ?? "Invalid input"
                );
            }
            const { email, password } = parsed.data;

            const existing = await User.findOne({ email });
            if (existing) {
                throw createGraphQLError("An account with this email already exists");
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const user = await User.create({
                email,
                passwordHash,
            });

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
            );

            return {
                token,
                displayId: user.displayId,
            };
        },

        login: async (
            _parent: unknown,
            args: { email: string; password: string }
        ) => {
            const parsed = loginSchema.safeParse(args);
            if (!parsed.success) {
                throw createGraphQLError(
                    parsed.error.issues[0]?.message ?? "Invalid input"
                );
            }
            const { email, password } = parsed.data;

            const user = await User.findOne({ email });
            if (!user) {
                throw createGraphQLError("Invalid email or password");
            }

            if (user.isBanned) {
                throw createGraphQLError("This account has been banned");
            }

            const passwordMatches = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatches) {
                throw createGraphQLError("Invalid email or password");
            }

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
            );

            return {
                token,
                displayId: user.displayId,
            };
        },
    },
};