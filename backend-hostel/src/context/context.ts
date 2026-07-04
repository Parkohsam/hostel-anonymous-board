import type { YogaInitialContext } from "graphql-yoga";
import jwt from "jsonwebtoken";

export interface AuthUser {
    userId: string;
    role: "user" | "admin";
}

export interface MyContext extends YogaInitialContext {
    user: AuthUser | null;
}

export async function createContext(
    initialContext: YogaInitialContext
): Promise<MyContext> {
    const authHeader = initialContext.request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { ...initialContext, user: null };
    }

    const token = authHeader.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as AuthUser;

        return { ...initialContext, user: decoded };
    } catch {
        return { ...initialContext, user: null };
    }
}