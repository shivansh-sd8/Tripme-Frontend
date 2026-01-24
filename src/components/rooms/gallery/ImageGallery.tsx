"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import FullscreenGallery from "./FullscreenGallery";
import { useGallery } from "./useGallery";

export default function ImageGallery({ images, title }) {
  const gallery = useGallery(images);
  const containerRef = useRef<HTMLDivElement>(null);

  const width =
    typeof window !== "undefined" ? window.innerWidth : 0;

  /* 🔥 PRELOAD NEXT IMAGE */
  useEffect(() => {
    const nextIndex = gallery.selected + 1;
    if (images[nextIndex]) {
      const img = new Image();
      img.src = images[nextIndex];
    }
  }, [gallery.selected, images]);

  return (
    <>
      {/* MOBILE SWIPE */}
      <div className="block lg:hidden relative overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex"
          drag="x"
          dragConstraints={{
            left: -(images.length - 1) * width,
            right: 0,
          }}
          onDragEnd={(e, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2;

            if (swipe < -width / 4 && gallery.selected < images.length - 1) {
              gallery.setSelected(gallery.selected + 1);
            } else if (swipe > width / 4 && gallery.selected > 0) {
              gallery.setSelected(gallery.selected - 1);
            }
          }}
          animate={{ x: -gallery.selected * width }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {images.map((img, index) => (
            <motion.img
              key={index}
              src={img}
              loading="lazy"                // ✅ Lazy loading
              decoding="async"
              alt={`${title} image ${index + 1}`}
              className="w-screen h-[320px] object-cover"
              onClick={() => gallery.openAt(index)}
              draggable={false}
            />
          ))}
        </motion.div>

        {/* INDEX INDICATOR */}
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
          {gallery.selected + 1} / {gallery.total}
        </div>
      </div>

      {/* DESKTOP GRID */}
      <div className="hidden lg:grid grid-cols-4 gap-2 max-w-7xl mx-auto px-4">
        <div className="col-span-2 row-span-2">
          <img
            src={images[gallery.selected]}
            loading="eager"
            className="w-full h-[500px] object-cover rounded-2xl cursor-pointer"
            onClick={() => gallery.openAt(gallery.selected)}
          />
        </div>

        {images.slice(1, 5).map((img, i) => (
          <img
            key={i}
            src={img}
            loading="lazy"
            className="w-full h-[245px] object-cover rounded-2xl cursor-pointer"
            onClick={() => gallery.openAt(i + 1)}
          />
        ))}
      </div>

      {/* FULLSCREEN */}
      <FullscreenGallery
        open={gallery.open}
        setOpen={gallery.setOpen}
        images={images}
        startIndex={gallery.selected}
      />
    </>
  );
}
