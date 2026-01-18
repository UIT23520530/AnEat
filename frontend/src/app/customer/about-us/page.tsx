"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Users, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import Image from "next/image";

interface AboutUsResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    id: string;
    title: string;
    content: string; // HTML content
    image: string | null;
    mission: string | null;
    vision: string | null;
    values: string | null; // JSON array or text
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function AboutPage() {
  const [aboutUs, setAboutUs] = useState<AboutUsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<AboutUsResponse>("/home/about-us");

        if (response.data.success && response.data.data) {
          setAboutUs(response.data.data);
        } else {
          setError("Không thể tải thông tin");
        }
      } catch (err: any) {
        console.error("Error fetching about us:", err);
        setError("Đã xảy ra lỗi khi tải thông tin");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  // Parse values nếu là JSON
  const parseValues = (values: string | null): string[] => {
    if (!values) return [];
    try {
      const parsed = JSON.parse(values);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return values.split(",").map((v) => v.trim());
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !aboutUs) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">{error || "Không tìm thấy thông tin"}</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const values = parseValues(aboutUs.values);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {aboutUs.image && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-12">
              <Image
                src={aboutUs.image}
                alt={aboutUs.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-6 text-center">{aboutUs.title}</h1>

          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: aboutUs.content }}
          />

          {aboutUs.mission && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-6 w-6 text-orange-500" />
                  <h3 className="font-semibold text-xl">Sứ mệnh</h3>
                </div>
                <p className="text-muted-foreground">{aboutUs.mission}</p>
              </CardContent>
            </Card>
          )}

          {aboutUs.vision && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-orange-500" />
                  <h3 className="font-semibold text-xl">Tầm nhìn</h3>
                </div>
                <p className="text-muted-foreground">{aboutUs.vision}</p>
              </CardContent>
            </Card>
          )}

          {values.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-orange-500" />
                  <h3 className="font-semibold text-xl">Giá trị cốt lõi</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <p className="text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
