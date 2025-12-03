"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, UserPlus } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please verify your email before logging in.");
        router.push("/auth/login");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-1 justify-center">
          <UserPlus size={22} /> Signup
        </h1>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Create your account to get started
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-2 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent ml-2 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <Lock size={18} className="text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent ml-2 focus:outline-none"
                placeholder="********"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Signup"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-gray-900 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
