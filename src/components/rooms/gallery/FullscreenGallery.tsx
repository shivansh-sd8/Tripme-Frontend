// // "use client";

// // import { motion, AnimatePresence } from "framer-motion";
// // import { X } from "lucide-react";
// // import { useState, useEffect } from "react";

// // export default function FullscreenGallery({
// //   open,
// //   setOpen,
// //   images,
// //   startIndex
// // }) {
// //   const [index, setIndex] = useState(startIndex);



// // useEffect(() => {
// //   if (open) {
// //     document.body.style.overflow = "hidden";
// //   } else {
// //     document.body.style.overflow = "";
// //   }

// //   return () => {
// //     document.body.style.overflow = "";
// //   };
// // }, [open]);
 


// //   return (
// //     <AnimatePresence>
// //       {open && (
// //         <motion.div
// //           className="fixed inset-0 z-50 bg-black"
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           exit={{ opacity: 0 }}
// //         >
// //           {/* Close */}
// //           <button
// //             className="absolute top-4 right-4 text-white z-50"
// //             onClick={() => setOpen(false)}
// //           >
// //             <X size={28} />
// //           </button>

// //           {/* Swipe */}
// //          <motion.div
// //   className="flex items-center justify-center h-full w-full"
// //   drag="x"
// //   dragConstraints={{ left: 0, right: 0 }}
// //   dragElastic={0.15}
// //   onDragEnd={(e, info) => {
// //     if (info.offset.x < -120) {
// //       setIndex((i) => Math.min(i + 1, images.length - 1));
// //     } else if (info.offset.x > 120) {
// //       setIndex((i) => Math.max(i - 1, 0));
// //     }
// //   }}
// //   style={{ touchAction: "pan-y" }} // ✅ allow vertical gestures
// // >
// //   <motion.img
// //     src={images[index]}
// //     className="max-h-full max-w-full object-contain"
// //     draggable={false}
// //   />
// // </motion.div>


// //           {/* Counter */}
// //           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
// //             {index + 1} / {images.length}
// //           </div>
// //         </motion.div>
// //       )}
// //     </AnimatePresence>
// //   );
// // }


// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { X, ChevronLeft, ChevronRight } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function FullscreenGallery({
//   open,
//   setOpen,
//   images,
//   startIndex
// }) {
//   const [index, setIndex] = useState(startIndex);

//   useEffect(() => {
//     if (open) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [open]);

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!open) return;
      
//       if (e.key === "ArrowLeft") {
//         setIndex((i) => Math.max(i - 1, 0));
//       } else if (e.key === "ArrowRight") {
//         setIndex((i) => Math.min(i + 1, images.length - 1));
//       } else if (e.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [open, images.length]);

//   const goToPrevious = () => {
//     setIndex((i) => Math.max(i - 1, 0));
//   };

//   const goToNext = () => {
//     setIndex((i) => Math.min(i + 1, images.length - 1));
//   };

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 z-50 bg-black"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           {/* Close Button */}
//           <button
//             className="absolute top-4 right-4 text-white z-50 p-2 hover:bg-white/10 rounded-full transition-colors"
//             onClick={() => setOpen(false)}
//           >
//             <X size={28} />
//           </button>

//           {/* Navigation Arrows */}
//           {images.length > 1 && (
//             <>
//               <button
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-50 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
//                 onClick={goToPrevious}
//                 disabled={index === 0}
//               >
//                 <ChevronLeft size={32} />
//               </button>
//               <button
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-50 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
//                 onClick={goToNext}
//                 disabled={index === images.length - 1}
//               >
//                 <ChevronRight size={32} />
//               </button>
//             </>
//           )}

//           {/* Image Container */}
//           <motion.div
//             className="flex items-center justify-center h-full w-full"
//             drag="x"
//             dragConstraints={{ left: 0, right: 0 }}
//             dragElastic={0.15}
//             onDragEnd={(e, info) => {
//               if (info.offset.x < -120) {
//                 goToNext();
//               } else if (info.offset.x > 120) {
//                 goToPrevious();
//               }
//             }}
//             style={{ touchAction: "pan-y" }}
//           >
//             <motion.img
//               key={index}
//               src={images[index]}
//               className="max-h-full max-w-full object-contain"
//               draggable={false}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.3 }}
//             />
//           </motion.div>

//           {/* Image Counter */}
//           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
//             {index + 1} / {images.length}
//           </div>

//           {/* Thumbnails */}
//           {images.length > 1 && (
//             <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80%] overflow-x-auto">
//               {images.map((img, i) => (
//                 <button
//                   key={i}
//                   className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
//                     i === index ? "border-white" : "border-transparent"
//                   }`}
//                   onClick={() => setIndex(i)}
//                 >
//                   <img
//                     src={img}
//                     alt={`Thumbnail ${i + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { X, ChevronLeft, ChevronRight } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function FullscreenGallery({
//   open,
//   setOpen,
//   images,
//   startIndex,
// }) {
//   const [index, setIndex] = useState(startIndex);

//   useEffect(() => {
//     if (open) document.body.style.overflow = "hidden";
//     else document.body.style.overflow = "";

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [open]);

//   useEffect(() => {
//     setIndex(startIndex);
//   }, [startIndex]);

//   const prev = () => setIndex((i) => Math.max(i - 1, 0));
//   const next = () =>
//     setIndex((i) => Math.min(i + 1, images.length - 1));

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 z-[999] bg-black"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           {/* TOP BAR */}
//           <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4 text-white z-50">
//             <span className="text-sm">
//               {index + 1} / {images.length}
//             </span>

//             <button
//               onClick={() => setOpen(false)}
//               className="p-2 hover:bg-white/10 rounded-full"
//             >
//               <X size={28} />
//             </button>
//           </div>

//           {/* IMAGE */}
//           <div className="flex items-center justify-center h-full">
//             <motion.img
//               key={index}
//               src={images[index]}
//               className="max-h-[90%] max-w-[90%] object-contain"
//               initial={{ opacity: 0.4, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.25 }}
//               draggable={false}
//             />
//           </div>

//           {/* DESKTOP ARROWS */}
//           {images.length > 1 && (
//             <>
//               <button
//                 onClick={prev}
//                 disabled={index === 0}
//                 className="absolute left-6 top-1/2 -translate-y-1/2 text-white p-3 bg-black/40 rounded-full disabled:opacity-30"
//               >
//                 <ChevronLeft size={28} />
//               </button>

//               <button
//                 onClick={next}
//                 disabled={index === images.length - 1}
//                 className="absolute right-6 top-1/2 -translate-y-1/2 text-white p-3 bg-black/40 rounded-full disabled:opacity-30"
//               >
//                 <ChevronRight size={28} />
//               </button>
//             </>
//           )}

//           {/* THUMBNAILS */}
//           {images.length > 1 && (
//             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80%] overflow-x-auto">
//               {images.map((img, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setIndex(i)}
//                   className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
//                     i === index
//                       ? "border-white"
//                       : "border-transparent"
//                   }`}
//                 >
//                   <img
//                     src={img}
//                     className="w-full h-full object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }


"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export default function FullscreenGallery({
  open,
  setOpen,
  images,
}) {
  // group by category
  const grouped = images.reduce((acc, img) => {
    const cat = typeof img === "string"
    ? "Other"
    : img.category || "Other";

    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(img);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  // lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollToCategory = (cat: string) => {
    const el = document.getElementById(`cat-${cat}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] bg-white overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ===== HEADER ===== */}
          <div className="sticky top-0 bg-white border-b z-50 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Photo tour</h2>

            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* ===== CATEGORY PREVIEW STRIP ===== */}
          <div className="px-6 py-6 flex gap-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className="flex-shrink-0 text-left"
              >
                <div className="w-40 h-24 rounded-lg overflow-hidden mb-2">
                  {/* <img
                    src={grouped[cat][0].url}
                    className="w-full h-full object-cover"
                  /> */}
                  <img
                      src={
                        typeof grouped[cat][0] === "string"
                          ? grouped[cat][0]
                          : grouped[cat][0].url
                      }
                      className="w-full h-full object-cover"
                    />

                </div>
                <p className="text-sm font-medium">{cat}</p>
              </button>
            ))}
          </div>

          {/* ===== IMAGE SECTIONS ===== */}
          <div className="px-6 pb-20 max-w-6xl mx-auto">
            {categories.map((cat) => (
              <section
                key={cat}
                id={`cat-${cat}`}
                className="mb-14"
              >
                <h3 className="text-3xl font-semibold mb-6">
                  {cat}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[cat].map((img, i) => (
                    <img
                      key={i}
                      // src={img.url}
                      src={typeof img === "string" ? img : img.url}

                      className="w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
