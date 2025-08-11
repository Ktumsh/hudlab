"use client";

import { motion } from "motion/react";
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
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: loading ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-base-100 pointer-events-none fixed inset-0 z-999 grid h-screen w-screen place-content-center"
        aria-live="assertive"
        aria-busy={loading}
        role="status"
      >
        {loading && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Logo
              width={200}
              height={200}
              className="size-24"
              aria-label="Cargando"
            />
            <span className="sr-only">Cargando...</span>
          </motion.div>
        )}
      </motion.div>
      {children}
    </>
  );
};

export default GlobalLoader;
