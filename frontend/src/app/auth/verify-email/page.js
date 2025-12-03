"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/auth/verify-email?token=${token}`
        );

        const data = await res.json();

        if (res.ok) {
          setMessage("Your email has been successfully verified!");
        } else {
          setMessage(data.error || "Verification failed");
        }
      } catch (err) {
        setMessage("Something went wrong while verifying.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">{message}</h1>
    </div>
  );
}
