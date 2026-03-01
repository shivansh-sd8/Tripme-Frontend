// "use client";
// import React, { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion, Reorder, useDragControls } from 'framer-motion';
// import { Upload, X, Plus, Loader2, GripVertical, Star, Image as ImageIcon } from 'lucide-react';
// import OnboardingLayout from '@/components/host/OnboardingLayout';
// import { useOnboarding } from '@/core/context/OnboardingContext';
// import { useParams, useSearchParams } from "next/navigation";
// interface PhotoItem {
//   id: string;
//   file?: File;
//   preview: string;
//   url?: string; // Cloudinary URL after upload
//   uploading?: boolean;
//   uploaded?: boolean;
// }

// export default function PhotosPage() {
//   const router = useRouter();
//   const { data, updateData } = useOnboarding();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [photos, setPhotos] = useState<PhotoItem[]>([]);
//   const [dragOver, setDragOver] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [reorderMode, setReorderMode] = useState(false);

//    const params = useParams();
//     const searchParams = useSearchParams();
//     const id = params.id;
//     const isEditMode = searchParams.get("mode") === "edit";
//     const returnToReview = searchParams.get("return") === "review";


//   // Initialize photos from context data on mount
//   useEffect(() => {
//     if (data.photos && data.photos.length > 0 && photos.length === 0) {
//       const existingPhotos: PhotoItem[] = data.photos.map((url, index) => ({
//         id: `existing-${index}`,
//         preview: url,
//         url: url,
//         uploaded: true,
//       }));
//       setPhotos(existingPhotos);
//     }
//   }, [data.photos]);

//   const uploadToCloudinary = async (file: File): Promise<string | null> => {
//     try {
//       const formData = new FormData();
//       formData.append('image', file);
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload/image`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('tripme_token')}`,
//         },
//         body: formData,
//       });
      
//       const result = await response.json();
//       if (result.success) {
//         return result.data.url;
//       }
//       console.error('Upload failed:', result.message);
//       return null;
//     } catch (error) {
//       console.error('Upload error:', error);
//       return null;
//     }
//   };

//   const handleFileSelect = async (files: FileList | null) => {
//     if (!files) return;
    
//     const newPhotos: PhotoItem[] = [];
//     Array.from(files).forEach((file) => {
//       if (file.type.startsWith('image/')) {
//         const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//         const preview = URL.createObjectURL(file);
//         newPhotos.push({ id, file, preview, uploading: true, uploaded: false });
//       }
//     });
    
//     setPhotos((prev) => [...prev, ...newPhotos]);
//     setUploading(true);

//     // Upload each photo to Cloudinary
//     for (const photo of newPhotos) {
//       if (photo.file) {
//         const cloudinaryUrl = await uploadToCloudinary(photo.file);
//         setPhotos((prev) => 
//           prev.map((p) => 
//             p.id === photo.id 
//               ? { ...p, url: cloudinaryUrl || undefined, uploading: false, uploaded: !!cloudinaryUrl }
//               : p
//           )
//         );
//       }
//     }
    
//     setUploading(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);
//     handleFileSelect(e.dataTransfer.files);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);
//   };

//   const removePhoto = (id: string) => {
//     setPhotos((prev) => {
//       const photo = prev.find((p) => p.id === id);
//       if (photo?.preview && photo.preview.startsWith('blob:')) {
//         URL.revokeObjectURL(photo.preview);
//       }
//       return prev.filter((p) => p.id !== id);
//     });
//   };

//   // Set a photo as cover (move to first position)
//   const setCoverPhoto = (id: string) => {
//     setPhotos((prev) => {
//       const photoIndex = prev.findIndex((p) => p.id === id);
//       if (photoIndex <= 0) return prev;
//       const newPhotos = [...prev];
//       const [photo] = newPhotos.splice(photoIndex, 1);
//       newPhotos.unshift(photo);
//       return newPhotos;
//     });
//   };

//   // Handle reorder from drag and drop
//   const handleReorder = (newOrder: PhotoItem[]) => {
//     setPhotos(newOrder);
//   };

//   const handleNext = () => {
//     // Store Cloudinary URLs in context (only uploaded photos)
//     const uploadedUrls = photos
//       .filter((p) => p.uploaded && p.url)
//       .map((p) => p.url as string);
//     updateData({ photos: uploadedUrls });

//      if (returnToReview) {
//     // Return to review page
//     if (isEditMode && id) {
//       router.push(`/host/property/${id}/review?mode=edit`);
//     } else {
//       router.push('/host/property/new/review');
//     }
//   } else {
//       if(isEditMode && id){
//       router.push(`/host/property/${id}/title?mode=edit`);
//     }else{
//      router.push('/host/property/new/title');
//     }
     
//   }
//   };

//   const minPhotos = 5;
//   const uploadedPhotos = photos.filter((p) => p.uploaded);
//   const hasEnoughPhotos = uploadedPhotos.length >= minPhotos;
//   const isUploading = photos.some((p) => p.uploading);

//   return (
//     <OnboardingLayout
//     flow="property"
//       currentMainStep={2}
//       currentSubStep="photos"
//       onNext={handleNext}
//       nextDisabled={!hasEnoughPhotos || isUploading}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-semibold text-gray-900 mb-2">
//           Add some photos of your place
//         </h1>
//         <p className="text-gray-500 mb-6">
//           You'll need {minPhotos} photos to get started. You can add more or make changes later.
//         </p>

//         {/* Upload Area */}
//         <div
//           onClick={() => fileInputRef.current?.click()}
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
//             dragOver
//               ? 'border-gray-900 bg-gray-50'
//               : 'border-gray-300 hover:border-gray-400'
//           }`}
//         >
//           <input
//             ref={fileInputRef}
//             type="file"
//             multiple
//             accept="image/*"
//             onChange={(e) => handleFileSelect(e.target.files)}
//             className="hidden"
//           />
//           <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <p className="text-lg font-medium text-gray-900 mb-1">
//             Drag your photos here
//           </p>
//           <p className="text-gray-500">
//             Choose at least {minPhotos} photos
//           </p>
//           <button
//             type="button"
//             className="mt-4 px-6 py-2 border border-gray-900 rounded-lg font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
//           >
//             Upload from your device
//           </button>
//         </div>

//         {/* Photo Count & Controls */}
//         <div className="mt-4 flex items-center justify-between">
//           <span className={`text-sm ${hasEnoughPhotos ? 'text-green-600' : 'text-gray-500'}`}>
//             {uploadedPhotos.length} / {minPhotos} photos uploaded {hasEnoughPhotos ? '✓' : 'required'}
//             {isUploading && <span className="ml-2 text-blue-600">(uploading...)</span>}
//           </span>
//           <div className="flex items-center gap-4">
//             {photos.length > 1 && (
//               <button
//                 onClick={() => setReorderMode(!reorderMode)}
//                 className={`flex items-center gap-2 text-sm font-medium transition-colors ${
//                   reorderMode ? 'text-gray-900 bg-gray-100 px-3 py-1 rounded-full' : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <GripVertical className="w-4 h-4" />
//                 {reorderMode ? 'Done' : 'Reorder'}
//               </button>
//             )}
//             {photos.length > 0 && (
//               <button
//                 onClick={() => fileInputRef.current?.click()}
//                 className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
//               >
//                 <Plus className="w-4 h-4" />
//                 Add more
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Reorder Instructions */}
//         {reorderMode && photos.length > 1 && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
//           >
//             <p className="text-sm text-blue-700">
//               <strong>Tip:</strong> Drag photos to reorder them. The first photo will be your cover photo.
//             </p>
//           </motion.div>
//         )}

//         {/* Photo Grid with Reorder */}
//         {photos.length > 0 && (
//           <Reorder.Group
//             axis="y"
//             values={photos}
//             onReorder={handleReorder}
//             className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
//           >
//             {photos.map((photo, index) => (
//               <Reorder.Item
//                 key={photo.id}
//                 value={photo}
//                 dragListener={reorderMode}
//                 className={`relative aspect-square rounded-xl overflow-hidden group cursor-${reorderMode ? 'grab' : 'default'} ${
//                   index === 0 ? 'md:col-span-2 md:row-span-2' : ''
//                 }`}
//               >
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="w-full h-full"
//                 >
//                   <img
//                     src={photo.url || photo.preview}
//                     alt={`Photo ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
                  
//                   {/* Uploading overlay */}
//                   {photo.uploading && (
//                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                       <Loader2 className="w-8 h-8 text-white animate-spin" />
//                     </div>
//                   )}
                  
//                   {/* Upload failed indicator */}
//                   {!photo.uploading && !photo.uploaded && (
//                     <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
//                       <span className="text-white text-sm bg-red-500 px-2 py-1 rounded">Upload failed</span>
//                     </div>
//                   )}
                  
//                   {/* Cover photo badge */}
//                   {index === 0 && photo.uploaded && (
//                     <div className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-sm font-medium shadow flex items-center gap-1">
//                       <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                       Cover photo
//                     </div>
//                   )}
                  
//                   {/* Reorder handle */}
//                   {reorderMode && (
//                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
//                       <div className="bg-white rounded-full p-3 shadow-lg">
//                         <GripVertical className="w-6 h-6 text-gray-600" />
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* Action buttons */}
//                   {!reorderMode && (
//                     <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       {/* Set as cover button (only for non-first photos) */}
//                       {index !== 0 && photo.uploaded && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setCoverPhoto(photo.id);
//                           }}
//                           className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
//                           title="Set as cover photo"
//                         >
//                           <Star className="w-4 h-4" />
//                         </button>
//                       )}
//                       {/* Remove button */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           removePhoto(photo.id);
//                         }}
//                         className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
//                         title="Remove photo"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                 </motion.div>
//               </Reorder.Item>
//             ))}
//           </Reorder.Group>
//         )}

//         {/* Tips */}
//         <div className="mt-8 p-4 bg-gray-50 rounded-xl">
//           <h3 className="font-medium text-gray-900 mb-2">Photo tips</h3>
//           <ul className="text-sm text-gray-600 space-y-1">
//             <li>• Use natural lighting when possible</li>
//             <li>• Show all the spaces guests can access</li>
//             <li>• Highlight unique features of your place</li>
//             <li>• Keep photos clean and uncluttered</li>
//           </ul>
//         </div>
//       </motion.div>
//     </OnboardingLayout>
//   );
// }


"use client";


import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Loader2, GripVertical, Star, Image as ImageIcon } from 'lucide-react';
import { Reorder, motion ,useDragControls } from "framer-motion";
import OnboardingLayout from "@/components/host/OnboardingLayout";
import { useOnboarding } from "@/core/context/OnboardingContext";
import { useParams, useSearchParams } from "next/navigation";

interface PhotoItem {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  uploading?: boolean;
  uploaded?: boolean;
  category: string;
  isCover?: boolean;
}

const PHOTO_CATEGORIES = [
  "Living room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Exterior",
  "Amenities",
  "Other",
];

export default function PhotosPage() {
 




   const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id;
    const isEditMode = searchParams.get("mode") === "edit";
    const returnToReview = searchParams.get("return") === "review";
  const router = useRouter();
  const { data , updateData } = useOnboarding();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<string>("Living room");

  // ================= UPLOAD =================

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tripme_token")}`,
        },
        body: formData,
      }
    );

    const result = await res.json();
    return result?.success ? result.data.url : null;
  };

  const handleCategoryUpload = async (
    files: FileList | null,
    category: string
  ) => {
    if (!files) return;

    const newPhotos: PhotoItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
        uploaded: false,
        category,
      }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    for (const photo of newPhotos) {
      const url = await uploadToCloudinary(photo.file!);

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? {
                ...p,
                url: url || undefined,
                uploaded: !!url,
                uploading: false,
              }
            : p
        )
      );
    }
  };

   useEffect(() => {
  if (!data.photos?.length) return;

  // avoid overwriting existing state
  if (photos.length > 0) return;

  const restoredPhotos: PhotoItem[] = data.photos.map(
    (photo: any, index: number) => ({
      id: `existing-${index}`,
      preview: photo.url,
      url: photo.url,
      uploaded: true,
      uploading: false,
      category: photo.category || "Other",
    })
  );

  setPhotos(restoredPhotos);
}, [data.photos]); 


  // ================= AUTO COVER =================

  useEffect(() => {
    setPhotos((prev) => {
      const updated = [...prev];

      PHOTO_CATEGORIES.forEach((cat) => {
        const first = updated.find((p) => p.category === cat);
        updated.forEach((p) => {
          if (p.category === cat) {
            p.isCover = p.id === first?.id;
          }
        });
      });

      return [...updated];
    });
  }, [photos.length]);

  // ================= REMOVE =================

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // ================= GROUP =================

  const groupedPhotos = PHOTO_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = photos.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, PhotoItem[]>);

  // ======
  // =========== SAVE =================


   

  // const handleNext = () => {
  //   updateData({
  //     photos: photos
  //       .filter((p) => p.uploaded)
  //       .map((p) => ({
  //         url: p.url,
  //         category: p.category,
  //       })),
  //   });

  //   router.push("/property/new/title");
  // };

  //   const handleNext = () => {
  //   // Store Cloudinary URLs in context (only uploaded photos)
  //   const uploadedUrls = photos
  //     .filter((p) => p.uploaded && p.url)
  //     .map((p) => p.url as string);
  //   updateData({ photos: uploadedUrls });

  //    if (returnToReview) {
  //   // Return to review page
  //   if (isEditMode && id) {
  //     router.push(`/host/property/${id}/review?mode=edit`);
  //   } else {
  //     router.push('/host/property/new/review');
  //   }
  // } else {
  //     if(isEditMode && id){
  //     router.push(`/host/property/${id}/title?mode=edit`);
  //   }else{
  //    router.push('/host/property/new/title');
  //   }
     
  // }
  // };

  const handleNext = () => {
  updateData({
    photos: photos
      .filter((p) => p.uploaded && p.url)
      .map((p) => ({
        url: p.url,
        category: p.category,
      })),
  });

  if (returnToReview) {
    if (isEditMode && id) {
      router.push(`/host/property/${id}/review?mode=edit`);
    } else {
      router.push("/host/property/new/review");
    }
  } else {
    if (isEditMode && id) {
      router.push(`/host/property/${id}/title?mode=edit`);
    } else {
      router.push("/host/property/new/title");
    }
  }
};


  const minPhotos = 5;
  const uploadedPhotos = photos.filter((p) => p.uploaded);

  return (
    <OnboardingLayout flow="property"
      currentMainStep={2}
      currentSubStep="photos"
      onNext={handleNext}
      nextDisabled={uploadedPhotos.length < minPhotos}
    >
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          Add photos of your place
        </h1>
        <p className="text-gray-500 mb-6">
          Upload photos room by room — just like Airbnb.
        </p>

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={(e) =>
            handleCategoryUpload(e.target.files, currentCategory)
          }
        />

        {/* CATEGORY SECTIONS */}
        {PHOTO_CATEGORIES.map((category) => (
          <div key={category} className="mb-10">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{category}</h2>

              <button
                onClick={() => {
                  setCurrentCategory(category);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm"
              >
                <Upload size={14} />
                Add photos
              </button>
            </div>

            {/* GRID */}
            <Reorder.Group
              axis="y"
              values={groupedPhotos[category]}
              onReorder={(newOrder) => {
                setPhotos((prev) => {
                  const others = prev.filter(
                    (p) => p.category !== category
                  );
                  return [...others, ...newOrder];
                });
              }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {groupedPhotos[category].map((photo) => (
                <Reorder.Item key={photo.id} value={photo}>
                  <motion.div
                    className={`relative rounded-xl overflow-hidden ${
                      photo.isCover
                        ? "md:col-span-2 md:row-span-2"
                        : ""
                    }`}
                  >
                    <img
                      src={photo.url || photo.preview}
                      className="w-full h-full object-cover"
                    />

                    {/* COVER BADGE */}
                    {photo.isCover && (
                      <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs shadow flex items-center gap-1">
                        <Star size={12} />
                        Cover
                      </div>
                    )}

                    {/* REMOVE */}
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                    >
                      <X size={14} />
                    </button>

                    {/* UPLOADING */}
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" />
                      </div>
                    )}
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        ))}

        <p className="text-sm text-gray-500 mt-4">
          {uploadedPhotos.length}/{minPhotos} photos uploaded
        </p>
      </div>
    </OnboardingLayout>
  );
}
