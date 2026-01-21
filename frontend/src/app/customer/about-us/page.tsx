"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Users, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import Image from "next/image";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

interface SettingsResponse {
  success: boolean;
  code: number;
  message: string;
  data: SystemSetting[];
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<{
    title: string;
    content: string;
    image: string;
    mission: string;
    vision: string;
    values: string;
  }>({
    title: "Về chúng tôi",
    content: "",
    image: "",
    mission: "",
    vision: "",
    values: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<SettingsResponse>("/home/settings");

        if (response.data.success && response.data.data) {
          const settings = response.data.data;
          const aboutSettings: Record<string, string> = {};

          // Extract about category settings
          settings.forEach((setting) => {
            if (setting.category === "about") {
              aboutSettings[setting.key] = setting.value;
            }
          });

          setAboutData({
            title: aboutSettings.about_title || "Về chúng tôi",
            content: aboutSettings.about_content || "",
            image: aboutSettings.about_image || "",
            mission: aboutSettings.about_mission || "",
            vision: aboutSettings.about_vision || "",
            values: aboutSettings.about_values || "",
          });
        } else {
          setError("Không thể tải thông tin");
        }
      } catch (err: any) {
        console.error("Error fetching settings:", err);
        setError("Đã xảy ra lỗi khi tải thông tin");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Parse values - split by newline or comma
  const parseValues = (values: string): string[] => {
    if (!values) return [];
    // Split by newline first, then by comma if no newlines
    const lines = values.split('\n').filter(line => line.trim());
    if (lines.length > 1) return lines;
    return values.split(',').map(v => v.trim()).filter(v => v);
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

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const values = parseValues(aboutData.values);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {aboutData.image && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-12">
              <Image
                src={aboutData.image}
                alt={aboutData.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-6 text-center">{aboutData.title}</h1>

          {aboutData.content && (
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-muted-foreground whitespace-pre-wrap">{aboutData.content}</p>
            </div>
          )}

          {aboutData.mission && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-6 w-6 text-orange-500" />
                  <h3 className="font-semibold text-xl">Sứ mệnh</h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{aboutData.mission}</p>
              </CardContent>
            </Card>
          )}

          {aboutData.vision && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-orange-500" />
                  <h3 className="font-semibold text-xl">Tầm nhìn</h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{aboutData.vision}</p>
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
