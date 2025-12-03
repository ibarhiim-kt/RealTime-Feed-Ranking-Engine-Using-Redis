// app/magic/login/page.js
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MagicLoginPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [message, setMessage] = useState("Logging in...");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid link");
      return;
    }

    const login = async () => {
      try {
        const res = await fetch(`http://localhost:4000/magic/login?token=${token}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          router.push("/"); // redirect after login
        } else {
          setMessage(data.error || "Magic link login failed");
        }
      } catch (err) {
        setMessage("Something went wrong");
      }
    };

    login();
  }, [token, router]);

  return <div className="min-h-screen flex items-center justify-center">{message}</div>;
}
