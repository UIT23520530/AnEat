"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

interface Banner {
  id: string;
  title: string | null;
  description: string | null;
  image: string;
  link: string | null;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerResponse {
  success: boolean;
  code: number;
  message: string;
  data: Banner[];
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log để debug
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        console.log('Fetching banners from:', `${apiUrl}/home/banners`);
        
        const response = await apiClient.get<BannerResponse>("/home/banners");
        
        if (response.data.success && response.data.data) {
          setBanners(response.data.data);
        } else {
          setError("Không thể tải banners");
        }
      } catch (err: any) {
        console.error("Error fetching banners:", err);
        console.error("Error details:", {
          message: err.message,
          code: err.code,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
        });
        
        // Xử lý các loại lỗi khác nhau
        if (err.code === 'ECONNREFUSED' || err.message === 'Network Error') {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.");
        } else if (err.response?.status === 404) {
          setError("API không tồn tại");
        } else if (err.response?.status >= 500) {
          setError("Lỗi server. Vui lòng thử lại sau.");
        } else {
          setError("Đã xảy ra lỗi khi tải banners");
        }
        
        // Fallback to empty array
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Fallback banners nếu API fail
  const fallbackBanners: Banner[] = [
    {
      id: "fallback-1",
      title: "NỞ CÀNG BỤNG VUI BẤT MOOD",
      description: "Combo 79.000đ",
      image: "/assets/fried-chicken-combo-meal.jpg",
      link: null,
      order: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "fallback-2",
      title: "BURGER PHÔ MAI",
      description: "Thử ngay burger phô mai mới",
      image: "/assets/cheese-burger.png",
      link: null,
      order: 1,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "fallback-3",
      title: "MỲ Ý THƯỢNG HẠNG",
      description: "Thưởng thức hương vị Ý đích thực",
      image: "/assets/classic-carbonara.png",
      link: null,
      order: 2,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Sử dụng fallback nếu không có banners từ API
  const displayBanners = banners.length > 0 ? banners : fallbackBanners;

  useEffect(() => {
    if (displayBanners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [displayBanners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  // Show loading state
  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-orange-50 to-orange-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative h-[350px] md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-200 animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-orange-50 to-orange-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Banner Carousel */}
        <div className="relative mb-10 overflow-visible">
          <div className="relative h-[350px] md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
            {displayBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title || banner.description || `Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                {/* Overlay with title and description if available */}
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                    <div className="container mx-auto px-8">
                      {banner.title && (
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                          {banner.title}
                        </h2>
                      )}
                      {banner.description && (
                        <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Positioned outside the banner */}
          <button
            onClick={previousSlide}
            className="absolute -left-6 md:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-6 md:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          {/* Dots Indicator */}
          {displayBanners.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {displayBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    currentSlide === index
                      ? "w-8 bg-orange-500"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-white hover:text-orange-500 hover:border-orange-500 border border-orange-500 px-[52.8px] py-[26.4px] text-[19.8px] font-bold shadow-lg hover:shadow-xl transition-colors duration-200"
          >
            <Package className="mr-2 h-5 w-5" />
            Đặt đến lấy
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-white hover:text-orange-500 hover:border-orange-500 border border-orange-500 px-[52.8px] py-[26.4px] text-[19.8px] font-bold shadow-lg hover:shadow-xl transition-colors duration-200"
          >
            <Truck className="mr-2 h-5 w-5" />
            Giao tận nơi
          </Button>
        </div>
      </div>
    </section>
  );
}