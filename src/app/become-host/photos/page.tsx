"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Upload, X, Plus, Loader2, GripVertical, Star, Image as ImageIcon } from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

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
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
   const [currentCategory, setCurrentCategory] =
      useState<string>("Living room");

  // Initialize photos from context data on mount
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


  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tripme_token')}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        return result.data.url;
      }
      console.error('Upload failed:', result.message);
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
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

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    const newPhotos: PhotoItem[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const preview = URL.createObjectURL(file);
        newPhotos.push({ id, file, preview, uploading: true, uploaded: false });
      }
    });
    
    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(true);

    // Upload each photo to Cloudinary
    for (const photo of newPhotos) {
      if (photo.file) {
        const cloudinaryUrl = await uploadToCloudinary(photo.file);
        setPhotos((prev) => 
          prev.map((p) => 
            p.id === photo.id 
              ? { ...p, url: cloudinaryUrl || undefined, uploading: false, uploaded: !!cloudinaryUrl }
              : p
          )
        );
      }
    }
    
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo?.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Set a photo as cover (move to first position)
  const setCoverPhoto = (id: string) => {
    setPhotos((prev) => {
      const photoIndex = prev.findIndex((p) => p.id === id);
      if (photoIndex <= 0) return prev;
      const newPhotos = [...prev];
      const [photo] = newPhotos.splice(photoIndex, 1);
      newPhotos.unshift(photo);
      return newPhotos;
    });
  };

   // ================= GROUP =================

  const groupedPhotos = PHOTO_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = photos.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, PhotoItem[]>);

  // Handle reorder from drag and drop
  const handleReorder = (newOrder: PhotoItem[]) => {
    setPhotos(newOrder);
  };

  const handleNext = () => {
    // Store Cloudinary URLs in context (only uploaded photos)
    updateData({
    photos: photos
      .filter((p) => p.uploaded && p.url)
      .map((p) => ({
        url: p.url,
        category: p.category,
      })),
  });
    router.push('/become-host/title');
  };

  const minPhotos = 5;
    const uploadedPhotos = photos.filter((p) => p.uploaded);
  
  const hasEnoughPhotos = uploadedPhotos.length >= minPhotos;
  const isUploading = photos.some((p) => p.uploading);

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
