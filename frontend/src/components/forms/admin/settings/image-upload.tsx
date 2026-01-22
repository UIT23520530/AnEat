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

    // Compress image before upload with adaptive quality
    const compressImage = async (file: File, targetSizeMB: number = 4): Promise<File> => {
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
                    
                    // Adaptive resize based on file size
                    let maxDimension = 1920;
                    if (file.size > 10 * 1024 * 1024) {
                        maxDimension = 1280; // Resize smaller for large files
                    }
                    
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
                    
                    // Try multiple quality levels to meet target size
                    const tryCompress = (quality: number) => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    const targetSize = targetSizeMB * 1024 * 1024;
                                    
                                    // If still too large and quality can be reduced, try lower quality
                                    if (blob.size > targetSize && quality > 0.3) {
                                        tryCompress(quality - 0.1);
                                    } else {
                                        const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
                                            type: 'image/jpeg',
                                            lastModified: Date.now(),
                                        });
                                        console.log('[ImageUpload] Compression result:', {
                                            original: file.size,
                                            compressed: compressedFile.size,
                                            quality,
                                            reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
                                        });
                                        resolve(compressedFile);
                                    }
                                } else {
                                    reject(new Error('Canvas to Blob conversion failed'));
                                }
                            },
                            'image/jpeg',
                            quality
                        );
                    };
                    
                    // Start with quality 0.75
                    tryCompress(0.75);
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
            
            // Compress image if it's not SVG (always compress for deployment)
            if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
                // Always compress to ensure it fits Vercel's 4.5MB limit
                const shouldCompress = file.size > 500 * 1024; // Compress if > 500KB
                
                if (shouldCompress) {
                    toast({
                        title: "Đang nén ảnh...",
                        description: "Ảnh của bạn đang được tối ưu hóa để tải lên",
                    });
                    
                    try {
                        // Target 4MB for safety (Vercel limit is 4.5MB)
                        fileToUpload = await compressImage(file, 4);
                        console.log("[ImageUpload] Image compressed:", {
                            originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                            compressedSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
                            reduction: `${((1 - fileToUpload.size / file.size) * 100).toFixed(1)}%`,
                        });
                        
                        // Check if compression was successful enough
                        if (fileToUpload.size > 4 * 1024 * 1024) {
                            toast({
                                title: "Lỗi",
                                description: `Ảnh vẫn quá lớn sau khi nén (${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB). Vui lòng chọn ảnh nhỏ hơn hoặc chất lượng thấp hơn.`,
                                variant: "destructive",
                            });
                            setUploading(false);
                            return;
                        }
                    } catch (compressError) {
                        console.error("[ImageUpload] Compression failed:", compressError);
                        toast({
                            title: "Lỗi",
                            description: "Không thể nén ảnh. Vui lòng thử ảnh khác.",
                            variant: "destructive",
                        });
                        setUploading(false);
                        return;
                    }
                }
                
                // Final size check (Vercel limit: 4.5MB, we use 4MB for safety)
                if (fileToUpload.size > 4 * 1024 * 1024) {
                    toast({
                        title: "Lỗi",
                        description: `Ảnh quá lớn (${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB). Vui lòng chọn ảnh nhỏ hơn 4MB.`,
                        variant: "destructive",
                    });
                    setUploading(false);
                    return;
                }
            } else {
                // SVG size limit (Vercel limit)
                if (file.size > 4 * 1024 * 1024) {
                    toast({
                        title: "Lỗi",
                        description: `File SVG quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Vui lòng chọn file nhỏ hơn 4MB.`,
                        variant: "destructive",
                    });
                    setUploading(false);
                    return;
                }
            }

            // Upload directly to Cloudinary (bypass Vercel limits)
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            console.log("[ImageUpload] Environment check:", {
                cloudName: cloudName || 'NOT SET',
                uploadPreset: uploadPreset || 'NOT SET',
                allEnvVars: Object.keys(process.env).filter(k => k.includes('CLOUDINARY'))
            });

            if (!cloudName || !uploadPreset || cloudName === '' || uploadPreset === '') {
                const errorMsg = `Cloudinary chưa được cấu hình. cloudName=${cloudName || 'empty'}, uploadPreset=${uploadPreset || 'empty'}. Vui lòng kiểm tra biến môi trường NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.`;
                console.error('[ImageUpload]', errorMsg);
                throw new Error(errorMsg);
            }

            const formData = new FormData();
            formData.append("file", fileToUpload);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "aneat-products");

            console.log("[ImageUpload] Uploading directly to Cloudinary:", {
                fileName: file.name,
                originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                compressedSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
            });

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const response = await fetch(cloudinaryUrl, {
                method: "POST",
                body: formData,
            });

            console.log("[ImageUpload] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ [ImageUpload] Cloudinary upload failed:", response.status, errorText);
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ [ImageUpload] Upload successful! URL:", data.secure_url);
            
            onChange(data.secure_url);
            toast({
                title: "Thành công",
                description: "Tải ảnh lên thành công",
            });
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
