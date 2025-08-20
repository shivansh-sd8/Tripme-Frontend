'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImageFile {
  url: string;
  publicId: string;
  isPrimary: boolean;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  type?: 'image' | 'video'; // Added type field
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Debug logging
  useEffect(() => {

  }, [images]);

  const uploadMedia = async (file: File): Promise<ImageFile> => {
    const formData = new FormData();
    formData.append('media', file);

    const token = localStorage.getItem('tripme_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Use a generic /upload/media endpoint if you have it, else fallback to /upload/image
    const response = await fetch(`${apiUrl}/upload/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload media');
    }

    const result = await response.json();
    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    return {
      url: result.data.url,
      publicId: result.data.publicId,
      isPrimary: images.length === 0,
      width: result.data.width,
      height: result.data.height,
      format: result.data.format,
      size: result.data.size,
      type: fileType
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} media files`);
      return;
    }

    setUploading(true);
    const newImages: ImageFile[] = [];

    try {
      for (const file of acceptedFiles) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const imageData = await uploadMedia(file);
        newImages.push(imageData);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload media');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxSize: 50 * 1024 * 1024, // 50MB for videos
    disabled: uploading || images.length >= maxImages
  });

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Delete from Cloudinary
      if (imageToRemove.publicId) {
        const token = localStorage.getItem('tripme_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        await fetch(`${apiUrl}/upload/image/${imageToRemove.publicId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }

    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);
    
    // If we removed the primary image and there are other images, make the first one primary
    if (imageToRemove.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((image, i) => ({
      ...image,
      isPrimary: i === index
    }));
    onImagesChange(newImages);
  };

  const updateCaption = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-purple-500" />
              <p className="text-sm text-gray-600">Uploading images...</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop files here' : 'Upload Images or Videos'}
              </p>
              <p className="text-sm text-gray-500">
                Drag & drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPEG, PNG, WebP, AVIF up to 5MB each • Max {maxImages} images
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{fileName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Property Images ({images.length}/{maxImages})</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div key={index} className="relative group rounded-xl shadow-md bg-white overflow-hidden transition-transform duration-200 hover:scale-105">
                <div className="aspect-[11/8] w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover rounded-t-xl"
                      onError={(e) => {
                        console.error('Image failed to load:', image.url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500 text-sm">No image URL</span>
                    </div>
                  )}
                  {image.isPrimary && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-xs px-3 py-1 rounded-full shadow-lg font-semibold z-10">
                      Primary
                    </span>
                  )}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-10 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  {/* Modern floating label caption input */}
                  <div className="relative mt-2">
                    <input
                      type="text"
                      id={`caption-${index}`}
                      value={image.caption || ''}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      className="block w-full px-3 pt-5 pb-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all peer"
                      placeholder=" "
                      autoComplete="off"
                    />
                    <label
                      htmlFor={`caption-${index}`}
                      className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-600 peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-gray-50 px-1 rounded"
                    >
                      Add caption...
                    </label>
                  </div>
                  {!image.isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(index)}
                      className="mt-3 w-full text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-purple-100 hover:to-indigo-100 text-gray-700 py-1 px-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 