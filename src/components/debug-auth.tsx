"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";

export default function DebugAuth() {
  const { user, isLoading } = useAuth();
  const [cookies, setCookies] = useState<string>("");
  const [mirrorData, setMirrorData] = useState<unknown>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCookies(document.cookie);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      // Test mirror endpoint
      fetch("https://api-hudlab.vercel.app/api/session-mirror", {
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => res.json())
        .then(setMirrorData)
        .catch((e) => setMirrorData({ error: e.message }));
    } else {
      setMirrorData(null);
    }
  }, [user]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed right-0 bottom-0 z-50 max-h-96 max-w-sm overflow-auto border border-gray-600 bg-black p-4 text-xs text-white">
      <h3 className="mb-2 font-bold">Debug Auth</h3>
      <div>
        <strong>User:</strong>{" "}
        {isLoading
          ? "Loading..."
          : user
            ? user.profile?.username || "No username"
            : "None"}
      </div>
      <div className="mt-2">
        <strong>Cookies:</strong>
        <pre className="mt-1 max-h-20 overflow-auto text-xs whitespace-pre-wrap">
          {cookies || "None"}
        </pre>
      </div>
      <div className="mt-2">
        <strong>Mirror Data:</strong>
        <pre className="mt-1 max-h-20 overflow-auto text-xs whitespace-pre-wrap">
          {mirrorData ? JSON.stringify(mirrorData, null, 2) : "None"}
        </pre>
      </div>
    </div>
  );
}
