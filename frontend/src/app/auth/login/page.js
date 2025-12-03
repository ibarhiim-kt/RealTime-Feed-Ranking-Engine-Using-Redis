"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, LogIn, KeyRound, User } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/oauth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-1">
          <LogIn size={22} /> Login
        </h1>
        <p className="text-gray-500 text-sm mb-6">Welcome back! Please sign in.</p>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-2 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent ml-2 focus:outline-none"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent ml-2 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Forgot Password */}
          <p
            onClick={() => router.push("/auth/password/forgot")}
            className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 text-right"
          >
            Forgot password?
          </p>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            {loading ? "" : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Magic Login */}
        <button
          onClick={() => router.push("/auth/magic/request")}
          className="cursor-pointer w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition flex items-center justify-center gap-2"
        >
          <KeyRound size={18} /> Login via email only
        </button>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="cursor-pointer w-full mt-3 bg-white py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center gap-2 text-gray-800 font-medium"
        >
          <User size={18} /> Continue with Google
        </button>

        {/* Signup */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-gray-900 font-medium hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
