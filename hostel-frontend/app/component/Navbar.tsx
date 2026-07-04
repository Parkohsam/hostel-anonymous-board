"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/login");
    }

    return (
        <nav className="flex items-center justify-between border-b border-[var(--color-board-cork)] px-6 py-4">
            <Link href="/" className="text-lg font-medium">
                The Board
            </Link>

            <div className="flex items-center gap-4 text-sm">
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="fw-bold text-[var(--color-whisper-grey)] hover:text-[var(--color-index-card)]"
                    >
                        Log out
                    </button>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="fw-bold text-[var(--color-whisper-grey)] hover:text-[var(--color-index-card)]"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="rounded bg-[var(--color-lamp-amber)] px-3 py-1.5 font-medium text-[var(--color-cork-shadow)]"
                        >
                            Join
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}