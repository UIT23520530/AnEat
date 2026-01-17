"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { bannerService, type Banner } from "@/services/banner.service";

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getActiveBanners();
        if (response.data && response.data.length > 0) {
          setBanners(response.data);
        } else {
          // Fallback to default banners if no data from API
          setBanners([
            {
              id: "1",
              imageUrl: "/assets/fried-chicken-combo-meal.jpg",
              title: "NỞ CÀNG BỤNG VUI BẤT MOOD",
              description: "Combo 79.000đ",
              badge: "Giá không đổi",
              displayOrder: 0,
              isActive: true,
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "2",
              imageUrl: "/assets/cheese-burger.png",
              title: "BURGER PHÔ MAI",
              description: "Thử ngay burger phô mai mới",
              badge: "Mới",
              displayOrder: 1,
              isActive: true,
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "3",
              imageUrl: "/assets/classic-carbonara.png",
              title: "MỲ Ý THƯỢNG HẠNG",
              description: "Thưởng thức hương vị Ý đích thực",
              badge: "Best Seller",
              displayOrder: 2,
              isActive: true,
              createdAt: "",
              updatedAt: "",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Use fallback banners on error
        setBanners([
          {
            id: "1",
            imageUrl: "/assets/fried-chicken-combo-meal.jpg",
            title: "NỞ CÀNG BỤNG VUI BẤT MOOD",
            description: "Combo 79.000đ",
            badge: "Giá không đổi",
            displayOrder: 0,
            isActive: true,
            createdAt: "",
            updatedAt: "",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-orange-50 to-white py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative h-[350px] md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-200 animate-pulse" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-gradient-to-b from-orange-50 to-white py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Banner Carousel */}
        <div className="relative mb-6 overflow-visible">
          <div className="relative h-[350px] md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || `Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
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
          <div className="flex justify-center gap-2 mt-6">
            {banners.map((_, index) => (
              <button
                key={index}
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600 px-12 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Đặt đến lấy
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600 px-12 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Giao tận nơi
          </Button>
        </div>
      </div>
    </section>
  );
}