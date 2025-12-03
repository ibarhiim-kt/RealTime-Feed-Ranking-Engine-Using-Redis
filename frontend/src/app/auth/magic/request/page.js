"use client";
import Link from "next/link";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequestMagicLinkPage() {
    const [email, setEmail] = useState("");
    const router = useRouter();
    useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/profile", {
          method: "GET",
          credentials: "include", // send cookies
        });

        if (res.ok) {
          // User is logged in, redirect to home
          router.push("/");
        }
        // else, stay on this page
      } catch (err) {
        console.log("Auth check failed:", err);
      }
    };

    checkAuth();
  }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:4000/magic/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Magic link sent! Check your email.");
            } else {
                alert(data.error || "Failed to send magic link");
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md p-6 border rounded-lg shadow">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    Login via email
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border p-2 rounded"
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded cursor-pointer"
                    >
                        Login
                    </button>
                </form>

                {/* Signup Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-600 underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
