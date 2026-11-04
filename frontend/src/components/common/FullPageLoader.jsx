
import { motion } from "motion/react";

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex
    min-h-screen flex-col items-center justify-center
    bg-[#0B1118]">

      {/* Loader */}
      <div className="relative flex h-16 w-16 items-center justify-center">

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full
          border-2 border-[#354652]
          border-t-[#5B9295]"
        />

        <span className="text-lg font-bold text-[#A5C2CE]">
          PI
        </span>

      </div>

      <p className="mt-6 text-sm font-medium
      tracking-wide text-[#B8C2CB]">
        Loading Placement Intelligence...
      </p>

      <p className="mt-2 text-xs text-[#71808C]">
        Preparing your workspace
      </p>

    </div>
  );
};

export default FullPageLoader;
