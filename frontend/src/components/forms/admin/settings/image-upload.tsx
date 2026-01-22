import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    required?: boolean;
}

export function ImageUpload({ value, onChange, label = "Ảnh", required = false }: ImageUploadProps) {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Compress image before upload
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Resize if too large (max 1920x1920)
                    const maxDimension = 1920;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with quality compression
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error('Canvas to Blob conversion failed'));
                            }
                        },
                        'image/jpeg',
                        0.8 // Quality 80%
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("[ImageUpload] File selected:", {
            name: file.name,
            size: file.size,
            type: file.type,
        });

        // Validate file type - accept all image types including SVG
        if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith('.svg')) {
            console.error("[ImageUpload] Invalid file type:", file.type);
            toast({
                title: "Lỗi",
                description: `Vui lòng chọn file ảnh. File type: ${file.type || 'unknown'}`,
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        try {
            let fileToUpload = file;
            
            // Compress image if it's not SVG and larger than 2MB
            if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
                if (file.size > 2 * 1024 * 1024) {
                    toast({
                        title: "Đang nén ảnh...",
                        description: "Ảnh của bạn đang được tối ưu hóa",
                    });
                    
                    try {
                        fileToUpload = await compressImage(file);
                        console.log("[ImageUpload] Image compressed:", {
                            originalSize: file.size,
                            compressedSize: fileToUpload.size,
                            reduction: `${((1 - fileToUpload.size / file.size) * 100).toFixed(1)}%`,
                        });
                    } catch (compressError) {
                        console.error("[ImageUpload] Compression failed, using original:", compressError);
                    }
                }
                
                // Final size check (Cloudinary free tier limit: 10MB)
                if (fileToUpload.size > 10 * 1024 * 1024) {
                    toast({
                        title: "Lỗi",
                        description: `Ảnh quá lớn (${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB). Vui lòng chọn ảnh nhỏ hơn 10MB.`,
                        variant: "destructive",
                    });
                    setUploading(false);
                    return;
                }
            } else {
                // SVG size limit
                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        title: "Lỗi",
                        description: `File SVG quá lớn. Vui lòng chọn file nhỏ hơn 5MB.`,
                        variant: "destructive",
                    });
                    setUploading(false);
                    return;
                }
            }

            const formData = new FormData();
            formData.append("file", fileToUpload);

            console.log("[ImageUpload] Uploading file:", file.name, "Size:", file.size, "Type:", file.type);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            console.log("[ImageUpload] Response status:", response.status);
            console.log("[ImageUpload] Response headers:", Object.fromEntries(response.headers.entries()));

            // Get response text first to see what we're getting
            const responseText = await response.text();
            console.log("[ImageUpload] Response text:", responseText);

            if (!response.ok) {
                console.error("❌ [ImageUpload] Upload failed with status:", response.status, responseText);
                throw new Error(`Upload failed: ${response.status} - ${responseText}`);
            }

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log("[ImageUpload] Parsed response data:", data);
            } catch (parseError) {
                console.error("❌ [ImageUpload] Failed to parse JSON:", parseError);
                throw new Error("Server returned invalid JSON: " + responseText);
            }

            if (data.success) {
                console.log("✅ [ImageUpload] Upload successful! URL:", data.url);
                onChange(data.url);
                toast({
                    title: "Thành công",
                    description: "Tải ảnh lên thành công",
                });
            } else {
                console.error("❌ [ImageUpload] Upload failed:", data.message);
                throw new Error(data.message || "Upload failed");
            }
        } catch (error: any) {
            console.error("❌ [ImageUpload] Upload error:", error);
            console.error("❌ [ImageUpload] Error stack:", error.stack);
            toast({
                title: "Lỗi tải ảnh",
                description: error.message || "Không thể tải ảnh lên. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            {/* Upload button and URL input side by side */}
            <div className="flex gap-2">
                {/* File Upload Button */}
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="image-upload"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="whitespace-nowrap"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Đang tải..." : "Tải lên"}
                    </Button>
                </div>

                {/* URL Input */}
                <Input
                    type="url"
                    placeholder="hoặc dán link ảnh vào đây..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1"
                />
            </div>

            {/* Image Preview */}
            {value && (
                <div className="relative mt-3">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                        {value.toLowerCase().endsWith('.svg') ? (
                            // Use regular img tag for SVG files
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => {
                                    toast({
                                        title: "Lỗi",
                                        description: "Không thể tải ảnh. Vui lòng kiểm tra URL",
                                        variant: "destructive",
                                    });
                                }}
                            />
                        ) : (
                            // Use Next.js Image component for other formats
                            <Image
                                src={value}
                                alt="Preview"
                                fill
                                className="object-cover"
                                onError={() => {
                                    toast({
                                        title: "Lỗi",
                                        description: "Không thể tải ảnh. Vui lòng kiểm tra URL",
                                        variant: "destructive",
                                    });
                                }}
                            />
                        )}
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
