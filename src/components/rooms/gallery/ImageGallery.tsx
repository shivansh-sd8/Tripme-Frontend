// "use client";

// import { motion } from "framer-motion";
// import { useEffect, useRef } from "react";
// import FullscreenGallery from "./FullscreenGallery";
// import { useGallery } from "./useGallery";
// import { Grid } from "lucide-react";

// export default function ImageGallery({ images, title }) {
//   const gallery = useGallery(images);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const width =
//     typeof window !== "undefined" ? window.innerWidth : 0;

//   /* 🔥 PRELOAD NEXT IMAGE */
//   useEffect(() => {
//     const nextIndex = gallery.selected + 1;
//     if (images[nextIndex]) {
//       const img = new Image();
//       img.src = images[nextIndex];
//     }
//   }, [gallery.selected, images]);

//   return (
//     <>
//       {/* MOBILE SWIPE */}
//       <div className="block lg:hidden relative overflow-hidden">
//         <motion.div
//           ref={containerRef}
//           className="flex"
//           drag="x"
//           dragConstraints={{
//             left: -(images.length - 1) * width,
//             right: 0,
//           }}
//           onDragEnd={(e, info) => {
//             const swipe = info.offset.x + info.velocity.x * 0.2;

//             if (swipe < -width / 4 && gallery.selected < images.length - 1) {
//               gallery.setSelected(gallery.selected + 1);
//             } else if (swipe > width / 4 && gallery.selected > 0) {
//               gallery.setSelected(gallery.selected - 1);
//             }
//           }}
//           animate={{ x: -gallery.selected * width }}
//           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         >
//           {images.map((img, index) => (
//             <motion.img
//               key={index}
//               src={img}
//               loading="lazy"                // ✅ Lazy loading
//               decoding="async"
//               alt={`${title} image ${index + 1}`}
//               className="w-screen h-[320px] object-cover"
//               onClick={() => gallery.openAt(index)}
//               draggable={false}
//             />
//           ))}
//         </motion.div>

//         {/* INDEX INDICATOR */}
//         <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
//           {gallery.selected + 1} / {gallery.total}
//         </div>
//       </div>

//       {/* DESKTOP GRID */}
//       <div className="hidden lg:grid grid-cols-4 gap-2 max-w-7xl mx-auto px-4">
//         <div className="col-span-2 row-span-2">
//           <img
//             src={images[gallery.selected]}
//             loading="eager"
//             className="w-full h-[500px] object-cover rounded-2xl cursor-pointer"
//             onClick={() => gallery.openAt(gallery.selected)}
//           />
//         </div>

//         {images.slice(1, 5).map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             loading="lazy"
//             className="w-full h-[245px] object-cover rounded-2xl cursor-pointer"
//             onClick={() => gallery.openAt(i + 1)}
//           />
//         ))}

//          <button
//           onClick={() => gallery.setOpen(true)}
//           className="absolute bottom-6 right-20 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:shadow-xl transition"
//         >
//           <Grid size={16} />
//           Show all photos
//         </button>
//       </div>

//       {/* FULLSCREEN */}
//       <FullscreenGallery
//         open={gallery.open}
//         setOpen={gallery.setOpen}
//         images={images}
//         startIndex={gallery.selected}
//       />
//     </>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import FullscreenGallery from "./FullscreenGallery";
import { useGallery } from "./useGallery";
import { Grid } from "lucide-react";

export default function ImageGallery({ images, title }) {
  const gallery = useGallery(images);
  const containerRef = useRef<HTMLDivElement>(null);

  const width =
    typeof window !== "undefined" ? window.innerWidth : 0;

  // PRELOAD NEXT IMAGE
  useEffect(() => {
    const nextIndex = gallery.selected + 1;
    if (images[nextIndex]) {
      const img = new Image();
      img.src = images[nextIndex];
    }
  }, [gallery.selected, images]);

  return (
    <>
      {/* ================= MOBILE SWIPE ================= */}
      <div className="block lg:hidden relative overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex"
          drag="x"
          dragConstraints={{
            left: -(images.length - 1) * width,
            right: 0,
          }}
          animate={{ x: -gallery.selected * width }}
          onDragEnd={(e, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2;

            if (swipe < -width / 4 && gallery.selected < images.length - 1) {
              gallery.setSelected(gallery.selected + 1);
            } else if (swipe > width / 4 && gallery.selected > 0) {
              gallery.setSelected(gallery.selected - 1);
            }
          }}
        >
          {images.map((img, i) => (
            <img
              key={i}
             src={typeof img === "string" ? img : img.url}
              className="w-screen h-[320px] object-cover"
              onClick={() => gallery.openAt(i)}
            />
          ))}
        </motion.div>

        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
          {gallery.selected + 1} / {images.length}
        </div>
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden lg:grid grid-cols-4 gap-2 max-w-7xl mx-auto px-4 relative">
        <div className="col-span-2 row-span-2">
          <img
              src={typeof images[0] === "string" ? images[0] : images[0].url}
            className="w-full h-[500px] object-cover rounded-2xl cursor-pointer"
            onClick={() => gallery.openAt(0)}
          />
        </div>

        {images.slice(1, 5).map((img, i) => (
          <img
            key={i}
             src={typeof img === "string" ? img : img.url}
            className="w-full h-[245px] object-cover rounded-2xl cursor-pointer"
            onClick={() => gallery.openAt(i + 1)}
          />
        ))}

        {/* ⭐ SHOW ALL BUTTON */}
        <button
          onClick={() => gallery.setOpen(true)}
          className="absolute bottom-6 right-8 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:shadow-xl transition"
        >
          <Grid size={16} />
          Show all photos
        </button>
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

