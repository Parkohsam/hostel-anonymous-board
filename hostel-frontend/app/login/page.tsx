"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      displayId
    }
  }
`;

interface LoginData {
    login: {
        token: string;
        displayId: string;
    };
}

interface LoginVars {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { loading, error }] = useMutation<LoginData, LoginVars>(LOGIN);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const result = await login({ variables: { email, password } });

        if (result.data) {
            localStorage.setItem("token", result.data.login.token);
            router.push("/");
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-lg bg-[var(--color-board-cork)] p-8"
            >
                <h1 className="mb-6 text-2xl">The Board</h1>

                <label className="mb-1 block text-sm text-[var(--color-whisper-grey)]">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-4 w-full rounded border border-[var(--color-whisper-grey)] bg-transparent px-3 py-2"
                />

                <label className="mb-1 block text-sm text-[var(--color-whisper-grey)]">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-4 w-full rounded border border-[var(--color-whisper-grey)] bg-transparent px-3 py-2"
                />

                {error && (
                    <p className="mb-4 text-sm text-[var(--color-pin-red)]">
                        {error.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-[var(--color-lamp-amber)] py-2 font-medium text-[var(--color-cork-shadow)] disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </main>
    );
}