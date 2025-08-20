"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Upload, 
  MapPin, 
  Tag, 
  Clock, 
  Globe,
  Mountain,
  Waves,
  Building2,
  Camera,
  Coffee,
  TreePine,
  Star,
  Award,
  Calendar,
  User,
  BookOpen,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/core/store/auth-context';
import { apiClient } from '@/infrastructure/api/clients/api-client';

const CreateStoryPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Adventure');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [images, setImages] = useState<Array<{url: string, caption: string, alt: string}>>([]);
  const [location, setLocation] = useState({
    city: '',
    state: '',
    country: ''
  });
  const [readTime, setReadTime] = useState(5);
  const [isPublished, setIsPublished] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const categories = [
    { value: 'Adventure', icon: <Mountain className="w-4 h-4" />, label: 'Adventure' },
    { value: 'Beach', icon: <Waves className="w-4 h-4" />, label: 'Beach' },
    { value: 'City', icon: <Building2 className="w-4 h-4" />, label: 'City' },
    { value: 'Photography', icon: <Camera className="w-4 h-4" />, label: 'Photography' },
    { value: 'Food', icon: <Coffee className="w-4 h-4" />, label: 'Food' },
    { value: 'Nature', icon: <TreePine className="w-4 h-4" />, label: 'Nature' },
    { value: 'Culture', icon: <Globe className="w-4 h-4" />, label: 'Culture' },
    { value: 'Heritage', icon: <Award className="w-4 h-4" />, label: 'Heritage' },
    { value: 'Wellness', icon: <Star className="w-4 h-4" />, label: 'Wellness' },
    { value: 'Mountain', icon: <Mountain className="w-4 h-4" />, label: 'Mountain' }
  ];

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('tripme_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setFeaturedImage(imageUrl);
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setImages([...images, { url: imageUrl, caption: '', alt: '' }]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!title.trim() || !excerpt.trim() || !content.trim() || !featuredImage) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const storyData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        tags,
        featuredImage,
        images,
        location,
        readTime,
        isPublished
      };

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tripme_token')}`
        },
        body: JSON.stringify(storyData)
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/stories/${data.data.story._id}`);
      } else {
        alert(data.message || 'Failed to create story');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const category = categories.find(c => c.value === cat);
    return category?.icon || <Globe className="w-4 h-4" />;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Header />
        <div className="pt-48 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign in to create stories</h3>
            <p className="text-gray-600 mb-8">You need to be signed in to share your travel stories.</p>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Header />
      
      <main className="pt-48 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => router.push('/stories')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Stories
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-display">
                      Create Your Story
                    </h1>
                    <p className="text-gray-600 font-body">Share your amazing travel experiences</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setPreviewMode(!previewMode)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isPublished ? 'Publish' : 'Save Draft'}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                {/* Featured Image */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image *
                  </label>
                  {featuredImage ? (
                    <div className="relative">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => setFeaturedImage('')}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-600">Click to upload featured image</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Title */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Your story title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent resize-none font-display"
                    style={{ minHeight: '60px' }}
                  />
                </div>

                {/* Excerpt */}
                <div className="mb-6">
                  <textarea
                    placeholder="Write a brief excerpt of your story..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full text-lg text-gray-600 placeholder-gray-400 border-none outline-none bg-transparent resize-none"
                    style={{ minHeight: '80px' }}
                    maxLength={300}
                  />
                  <div className="text-right text-sm text-gray-400">
                    {excerpt.length}/300
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6 relative">
                  <div
                    ref={contentRef}
                    contentEditable={!previewMode}
                    suppressContentEditableWarning
                    onInput={(e) => setContent(e.currentTarget.textContent || '')}
                    className="w-full text-lg text-gray-700 leading-relaxed min-h-[400px] border-none outline-none bg-transparent resize-none prose prose-lg max-w-none"
                    style={{ 
                      minHeight: '400px',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {content}
                  </div>
                  {!content && !previewMode && (
                    <div className="absolute top-0 left-0 pointer-events-none text-gray-400">
                      Start writing your amazing travel story...
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Publish Settings */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Publish Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          className="flex-1 px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200"
                        />
                        <Button
                          onClick={handleAddTag}
                          disabled={!newTag.trim() || tags.length >= 10}
                          className="px-4 py-2"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-purple-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Read Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={readTime}
                        onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={location.city}
                          onChange={(e) => setLocation({...location, city: e.target.value})}
                          className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200"
                        />
                        <input
                          type="text"
                          placeholder="State/Province"
                          value={location.state}
                          onChange={(e) => setLocation({...location, state: e.target.value})}
                          className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={location.country}
                          onChange={(e) => setLocation({...location, country: e.target.value})}
                          className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="publish"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="publish" className="text-sm text-gray-700">
                        Publish immediately
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Additional Images */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Images</h3>
                  <div className="space-y-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt="Story image"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
                    >
                      <div className="text-center">
                        <Plus className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Add more images</p>
                      </div>
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateStoryPage; 