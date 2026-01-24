"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export default function FullscreenGallery({
  open,
  setOpen,
  images,
  startIndex
}) {
  const [index, setIndex] = useState(startIndex);



useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [open]);
 


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => setOpen(false)}
          >
            <X size={28} />
          </button>

          {/* Swipe */}
         <motion.div
  className="flex items-center justify-center h-full w-full"
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.15}
  onDragEnd={(e, info) => {
    if (info.offset.x < -120) {
      setIndex((i) => Math.min(i + 1, images.length - 1));
    } else if (info.offset.x > 120) {
      setIndex((i) => Math.max(i - 1, 0));
    }
  }}
  style={{ touchAction: "pan-y" }} // ✅ allow vertical gestures
>
  <motion.img
    src={images[index]}
    className="max-h-full max-w-full object-contain"
    draggable={false}
  />
</motion.div>


          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
            {index + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
