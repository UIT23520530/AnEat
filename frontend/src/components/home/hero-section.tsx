"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

const banners = [
  {
    src: "/fried-chicken-combo-meal.jpg",
    alt: "Special combo",
    title: "Ưu đãi đặc biệt",
    description: "Combo gà rán chỉ 89.000đ!",
  },
  {
    src: "/cheese-burger.png",
    alt: "Cheese burger",
    title: "Burger Phô Mai",
    description: "Thử ngay burger phô mai mới của chúng tôi.",
  },
  {
    src: "/classic-carbonara.png",
    alt: "Pasta",
    title: "Mỳ Ý Thượng Hạng",
    description: "Thưởng thức hương vị Ý đích thực.",
  },
];

export function HeroSection() {
  return (
    <section className="w-full bg-orange-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <Carousel
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                      {banner.title}
                    </h2>
                    <p className="text-lg md:text-xl">{banner.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </Carousel>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600"
          >
            Đặt đến lấy
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600"
          >
            Giao tận nơi
          </Button>
        </div>
      </div>
    </section>
  );
}