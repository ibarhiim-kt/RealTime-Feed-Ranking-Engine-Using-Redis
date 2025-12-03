'use client'

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function ProfileMenu({ user }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Profile Avatar */}
      <button className="flex items-center gap-2 p-1 rounded-full hover:shadow-md transition duration-200">
        <img
          src={user?.avatar || `https://i.pravatar.cc/40?u=${user?.email || 'me'}`}
          alt="avatar"
          className="w-10 h-10 rounded-full border border-gray-200"
        />
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {user?.email || 'You'}
        </span>
      </button>

      {/* Logout Icon */}
      
        <LogOut onClick={handleLogout} title="Logout" disabled={loading} size={20} className="cursor-pointer hover:text-red-500 transition-colors" />
      
    </div>
  );
}
