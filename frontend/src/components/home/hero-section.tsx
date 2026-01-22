"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { bannerService, type Banner } from "@/services/banner.service";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/branch-context";
import { BranchSelectorDialog } from "../branch/branch-selector-dialog";

export function HeroSection() {
  const router = useRouter();
  const { openBranchSelector } = useBranch();
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

  // Handle Pickup - Open branch selector and set order type
  const handlePickup = () => {
    // Save order type to localStorage for menu page
    if (typeof window !== "undefined") {
      localStorage.setItem("orderType", "PICKUP");
    }
    openBranchSelector();
  };

  // Handle Delivery - Navigate to menu
  const handleDelivery = () => {
    router.push("/customer/menu");
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
                  src={banner.imageUrl}
                  alt={banner.title || `Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                {/* Overlay with title and description if available */}
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 flex items-end justify-start">
                    <div className="p-8 md:p-12 lg:p-16 max-w-2xl">
                      {banner.title && (
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2 md:mb-4 text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                          {banner.title}
                        </h2>
                      )}
                      {banner.description && (
                        <p className="text-base md:text-lg lg:text-xl text-white font-semibold text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] [text-shadow:_1px_1px_3px_rgb(0_0_0_/_70%)]">
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
            onClick={handlePickup}
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-white hover:text-orange-500 hover:border-orange-500 border border-orange-500 px-[52.8px] py-[26.4px] text-[19.8px] font-bold shadow-lg hover:shadow-xl transition-colors duration-200"
          >
            <Package className="mr-2 h-5 w-5" />
            Đặt đến lấy
          </Button>
          <Button
            size="lg"
            onClick={handleDelivery}
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-white hover:text-orange-500 hover:border-orange-500 border border-orange-500 px-[52.8px] py-[26.4px] text-[19.8px] font-bold shadow-lg hover:shadow-xl transition-colors duration-200"
          >
            <Truck className="mr-2 h-5 w-5" />
            Giao tận nơi
          </Button>
        </div>

        {/* Branch Selector Dialog */}
        <BranchSelectorDialog />
      </div>
    </section>
  );
}