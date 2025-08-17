"use client";

import { IconSparkles } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface SuccessStepProps {
  title?: string;
}

export default function SuccessStep({
  title = "¡HUD creado exitosamente!",
}: SuccessStepProps) {
  return (
    <div className="py-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 10,
        }}
        className="mb-4"
      >
        <div className="bg-success/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <IconSparkles className="text-success h-8 w-8" />
        </div>
      </motion.div>
      <h3 className="text-base-content mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-base-content/60">Redirigiendo...</p>
    </div>
  );
}
