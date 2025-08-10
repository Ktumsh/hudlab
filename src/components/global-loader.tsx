"use client";

import { useLayoutEffect, useState } from "react";

import Logo from "./logo";

const GlobalLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div className="bg-base-100 fixed inset-0 z-999 grid h-screen w-screen place-content-center">
          <Logo width={200} height={200} className="size-24" />
        </div>
      )}
      {children}
    </>
  );
};

export default GlobalLoader;
