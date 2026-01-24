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
  url?: string; // Cloudinary URL after upload
  uploading?: boolean;
  uploaded?: boolean;
}

export default function PhotosPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  // Initialize photos from context data on mount
  useEffect(() => {
    if (data.photos && data.photos.length > 0 && photos.length === 0) {
      const existingPhotos: PhotoItem[] = data.photos.map((url, index) => ({
        id: `existing-${index}`,
        preview: url,
        url: url,
        uploaded: true,
      }));
      setPhotos(existingPhotos);
    }
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

  // Handle reorder from drag and drop
  const handleReorder = (newOrder: PhotoItem[]) => {
    setPhotos(newOrder);
  };

  const handleNext = () => {
    // Store Cloudinary URLs in context (only uploaded photos)
    const uploadedUrls = photos
      .filter((p) => p.uploaded && p.url)
      .map((p) => p.url as string);
    updateData({ photos: uploadedUrls });
    router.push('/host/property/new/title');
  };

  const minPhotos = 5;
  const uploadedPhotos = photos.filter((p) => p.uploaded);
  const hasEnoughPhotos = uploadedPhotos.length >= minPhotos;
  const isUploading = photos.some((p) => p.uploading);

  return (
    <OnboardingLayout
      currentMainStep={2}
      currentSubStep="photos"
      onNext={handleNext}
      nextDisabled={!hasEnoughPhotos || isUploading}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Add some photos of your place
        </h1>
        <p className="text-gray-500 mb-6">
          You'll need {minPhotos} photos to get started. You can add more or make changes later.
        </p>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Drag your photos here
          </p>
          <p className="text-gray-500">
            Choose at least {minPhotos} photos
          </p>
          <button
            type="button"
            className="mt-4 px-6 py-2 border border-gray-900 rounded-lg font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
          >
            Upload from your device
          </button>
        </div>

        {/* Photo Count & Controls */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm ${hasEnoughPhotos ? 'text-green-600' : 'text-gray-500'}`}>
            {uploadedPhotos.length} / {minPhotos} photos uploaded {hasEnoughPhotos ? '✓' : 'required'}
            {isUploading && <span className="ml-2 text-blue-600">(uploading...)</span>}
          </span>
          <div className="flex items-center gap-4">
            {photos.length > 1 && (
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  reorderMode ? 'text-gray-900 bg-gray-100 px-3 py-1 rounded-full' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GripVertical className="w-4 h-4" />
                {reorderMode ? 'Done' : 'Reorder'}
              </button>
            )}
            {photos.length > 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Plus className="w-4 h-4" />
                Add more
              </button>
            )}
          </div>
        </div>

        {/* Reorder Instructions */}
        {reorderMode && photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Drag photos to reorder them. The first photo will be your cover photo.
            </p>
          </motion.div>
        )}

        {/* Photo Grid with Reorder */}
        {photos.length > 0 && (
          <Reorder.Group
            axis="y"
            values={photos}
            onReorder={handleReorder}
            className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {photos.map((photo, index) => (
              <Reorder.Item
                key={photo.id}
                value={photo}
                dragListener={reorderMode}
                className={`relative aspect-square rounded-xl overflow-hidden group cursor-${reorderMode ? 'grab' : 'default'} ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full"
                >
                  <img
                    src={photo.url || photo.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Uploading overlay */}
                  {photo.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  
                  {/* Upload failed indicator */}
                  {!photo.uploading && !photo.uploaded && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <span className="text-white text-sm bg-red-500 px-2 py-1 rounded">Upload failed</span>
                    </div>
                  )}
                  
                  {/* Cover photo badge */}
                  {index === 0 && photo.uploaded && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-sm font-medium shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      Cover photo
                    </div>
                  )}
                  
                  {/* Reorder handle */}
                  {reorderMode && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <GripVertical className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  {!reorderMode && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Set as cover button (only for non-first photos) */}
                      {index !== 0 && photo.uploaded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverPhoto(photo.id);
                          }}
                          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                          title="Set as cover photo"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}

        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-2">Photo tips</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use natural lighting when possible</li>
            <li>• Show all the spaces guests can access</li>
            <li>• Highlight unique features of your place</li>
            <li>• Keep photos clean and uncluttered</li>
          </ul>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
