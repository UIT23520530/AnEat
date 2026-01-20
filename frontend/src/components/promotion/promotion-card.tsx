"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import Image from "next/image";

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all h-full flex flex-col bg-white rounded-3xl border-0">
      <div className="aspect-square relative overflow-visible rounded-t-3xl bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-3">
        <Badge className="absolute top-5 right-5 z-10 bg-red-400 text-white font-bold text-sm px-3 py-1">
          {promotion.discount}
        </Badge>
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src={promotion.image || "/placeholder.svg"}
            alt={promotion.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            quality={75}
            loading="lazy"
          />
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 text-gray-700">
          {promotion.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {promotion.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {promotion.validFrom} - {promotion.validTo}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
