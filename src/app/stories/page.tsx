"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Heart, 
  Eye, 
  MessageCircle,
  Plus,
  BookOpen,
  Mountain,
  Waves,
  Building2,
  Camera,
  Coffee,
  TreePine,
  Star,
  Globe,
  Award,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';

interface Story {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  readTime: number;
  views: number;
  likes: string[];
  comments: any[];
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  tags: string[];
  location?: {
    city: string;
    state: string;
    country: string;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  count: number;
}

const StoriesPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchStories();
    fetchCategories();
  }, [currentPage, selectedCategory, searchTerm, sortBy, sortOrder]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.data.stories);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/categories`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Adventure':
        return <Mountain className="w-4 h-4" />;
      case 'Beach':
        return <Waves className="w-4 h-4" />;
      case 'City':
        return <Building2 className="w-4 h-4" />;
      case 'Photography':
        return <Camera className="w-4 h-4" />;
      case 'Food':
        return <Coffee className="w-4 h-4" />;
      case 'Nature':
        return <TreePine className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateStory = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/stories/create');
  };

  if (loading && stories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Header />
        <div className="pt-48 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading stories</h2>
            <p className="text-gray-600">Finding amazing travel stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Header />
      
      <main className="pt-48 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-display">
                      Travel Stories
                    </h1>
                    <p className="text-gray-600 font-body">Discover amazing adventures and experiences</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleCreateStory}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Share Your Story
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-purple-600" />
                    Search Stories
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search stories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                    />
                  </div>
                </Card>

                {/* Categories */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-purple-600" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        selectedCategory === '' 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      All Stories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => setSelectedCategory(category._id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${
                          selectedCategory === category._id 
                            ? 'bg-purple-100 text-purple-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category._id)}
                          <span>{category._id}</span>
                        </div>
                        <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Sort Options */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Sort By
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                        sortBy === 'createdAt' && sortOrder === 'desc'
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Latest First
                    </button>
                    <button
                      onClick={() => { setSortBy('views'); setSortOrder('desc'); }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                        sortBy === 'views' && sortOrder === 'desc'
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Most Popular
                    </button>
                    <button
                      onClick={() => { setSortBy('likes'); setSortOrder('desc'); }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                        sortBy === 'likes' && sortOrder === 'desc'
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Most Liked
                    </button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {stories.length === 0 ? (
                <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No stories found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm || selectedCategory 
                      ? "No stories match your current filters. Try adjusting your search criteria."
                      : "Be the first to share your amazing travel story!"
                    }
                  </p>
                  <Button 
                    onClick={handleCreateStory}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Share Your Story
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stories.map((story) => (
                    <Card 
                      key={story._id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden group"
                      onClick={() => router.push(`/stories/${story._id}`)}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={story.featuredImage}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {getCategoryIcon(story.category)}
                            <span>{story.category}</span>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-gray-600">{story.author.name}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{formatDate(story.createdAt)}</span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{story.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{story.excerpt}</p>
                        
                        {story.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{story.location.city}, {story.location.country}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{story.readTime} min read</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{story.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{story.likes.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{story.comments.length}</span>
                            </div>
                          </div>
                          
                          {story.tags.length > 0 && (
                            <div className="flex gap-1">
                              {story.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="px-4 py-2"
                    >
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="px-4 py-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StoriesPage; 