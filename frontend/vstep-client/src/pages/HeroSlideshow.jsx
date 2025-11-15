
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle } from 'lucide-react'; 


const HeroSlideshow = () => {
  const [slidesData, setSlidesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const AUTOPLAY_DELAY = 3000;
  const ANIMATION_DURATION = 800;
  
  useEffect(() => {
    async function fetchSlides() {
      try {
        const response = await fetch('http://localhost:5000/api/slideshow');
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu slideshow');
        }
        const data = await response.json();
        setSlidesData(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSlides();
  }, []);

  const handleNext = useCallback(() => {
    if (isAnimating || slidesData.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, [isAnimating, slidesData.length]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleNext();
    }, AUTOPLAY_DELAY);
  }, [handleNext, AUTOPLAY_DELAY]);

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide || slidesData.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, [isAnimating, currentSlide, slidesData.length]);

  useEffect(() => {
    if (slidesData.length > 0) { 
      resetTimeout();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentSlide, slidesData.length, resetTimeout]);

  if (loading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center bg-gray-900">
        <p className="text-white text-2xl">Đang tải dữ liệu Slideshow...</p>
      </div>
    );
  }
  
  if (slidesData.length === 0) {
     return (
      <div className="relative flex h-screen w-full items-center justify-center bg-gray-900">
        <p className="text-red-500 text-2xl">Lỗi: Không tìm thấy dữ liệu slideshow.</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Ảnh nền */}
      {slidesData.map((slide, index) => (
        <img
          key={slide.slide_id}
          src={slide.anh_url} 
          alt={slide.tieu_de}
          className={`absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      
      <div className="absolute top-0 left-0 h-full w-full bg-black bg-opacity-40" />

      {/* NỘI DUNG */}
      <div 
        key={currentSlide} 
        className="relative z-10 flex h-full items-center text-left text-white"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 
              className="text-4xl font-bold leading-tight text-white md:text-6xl 
                         animate-fade-in-left"
              style={{ animationDuration: '800ms', animationDelay: '200ms', animationFillMode: 'both' }}
            >
              {slidesData[currentSlide].tieu_de}
            </h1>
            
            <p 
              className="mt-6 text-lg text-gray-200 md:text-xl 
                         animate-fade-in-left"
              style={{ animationDuration: '800ms', animationDelay: '400ms', animationFillMode: 'both' }}
            >
              {slidesData[currentSlide].mo_ta}
            </p>

            <div 
              className="mt-8 flex flex-wrap gap-3
                         animate-fade-in-left"
              style={{ animationDuration: '800ms', animationDelay: '600ms', animationFillMode: 'both' }}
            >
              {slidesData[currentSlide].features && slidesData[currentSlide].features.map((featureText) => (
                <div 
                  key={featureText}
                  className="flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm"
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-300" />
                  <span>{featureText}</span>
                </div>
              ))}
            </div>
            
            <button 
              className="mt-10 transform rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white 
                         shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-700 hover:scale-105
                         animate-fade-in-bottom"
              style={{ animationDuration: '800ms', animationDelay: '800ms', animationFillMode: 'both' }}
            >
              {slidesData[currentSlide].nut_cta}
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slidesData.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={`rounded-full bg-white transition-all duration-300 ease-in-out
              ${
                index === currentSlide
                  ? 'h-3 w-8 bg-opacity-100'
                  : 'h-3 w-3 bg-opacity-50 hover:bg-opacity-75'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;