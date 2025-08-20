"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';

interface CarouselImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ 
  images, 
  autoPlay = true, 
  interval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Main Image */}
      <div className="relative h-full w-full">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 z-10"
        >
          <ChevronRight size={24} />
        </button>
        {/* Details Box */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {images[currentIndex].title}
                </h3>
                <div className="flex items-center text-white/90 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{images[currentIndex].location}</span>
                </div>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Star size={16} className="text-yellow-400 fill-current mr-1" />
                <span className="text-white text-sm font-medium">
                  {images[currentIndex].rating}
                </span>
                <span className="text-white/70 text-xs ml-1">
                  ({images[currentIndex].reviewCount})
                </span>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {images[currentIndex].description}
            </p>
          </div>
        </div>
        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel; 