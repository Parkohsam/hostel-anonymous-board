"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

interface RegisterData {
    register: {
        token: string;
        displayId: string;
    };
}

interface RegisterVars {
    email: string;
    password: string;
}

const REGISTER: TypedDocumentNode<RegisterData, RegisterVars> = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      displayId
    }
  }
`;

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [register, { loading, error }] = useMutation(REGISTER);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const result = await register({ variables: { email, password } });

        if (result.data) {
            localStorage.setItem("token", result.data.register.token);
            router.push("/");
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-lg bg-[var(--color-board-cork)] p-8"
            >
                <h1 className="mb-2 text-2xl">Join the board</h1>
                <p className="mb-6 text-sm text-[var(--color-whisper-grey)]">
                    You&apos;ll be assigned an anonymous ID. No one will see your email.
                </p>

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
                    minLength={8}
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
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>
        </main>
    );
}