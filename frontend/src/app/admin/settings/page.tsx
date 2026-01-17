"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bannerService, type Banner } from "@/services/banner.service";
import { systemSettingService, type SystemSetting } from "@/services/system-setting.service";
import Image from "next/image";

interface BannerFormData {
  imageUrl: string;
  title: string;
  description: string;
  badge: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  
  // Banner form state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormData>({
    imageUrl: "",
    title: "",
    description: "",
    badge: "",
  });

  // Settings by category
  const [generalSettings, setGeneralSettings] = useState<Record<string, string>>({});
  const [contactSettings, setContactSettings] = useState<Record<string, string>>({});
  const [businessSettings, setBusinessSettings] = useState<Record<string, string>>({});
  const [aboutSettings, setAboutSettings] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, settingsRes] = await Promise.all([
        bannerService.getAllBanners(),
        systemSettingService.getAllSettings(),
      ]);

      setBanners(bannersRes.data);
      setSettings(settingsRes.data);

      // Group settings by category
      const general: Record<string, string> = {};
      const contact: Record<string, string> = {};
      const business: Record<string, string> = {};
      const about: Record<string, string> = {};

      settingsRes.data.forEach((setting) => {
        if (setting.category === "general") {
          general[setting.key] = setting.value;
        } else if (setting.category === "contact") {
          contact[setting.key] = setting.value;
        } else if (setting.category === "business") {
          business[setting.key] = setting.value;
        } else if (setting.category === "about") {
          about[setting.key] = setting.value;
        }
      });

      setGeneralSettings(general);
      setContactSettings(contact);
      setBusinessSettings(business);
      setAboutSettings(about);
      
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message || "Có lỗi xảy ra khi tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Banner handlers
  const handleCreateBanner = async () => {
    if (!bannerForm.imageUrl) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập URL ảnh",
        variant: "destructive",
      });
      return;
    }

    try {
      await bannerService.createBanner(bannerForm);
      toast({
        title: "Thành công",
        description: "Tạo banner thành công",
      });
      setBannerForm({ imageUrl: "", title: "", description: "", badge: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi tạo banner",
        description: error.message || "Không thể tạo banner",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner) return;

    try {
      await bannerService.updateBanner(editingBanner.id, bannerForm);
      toast({
        title: "Thành công",
        description: "Cập nhật banner thành công",
      });
      setEditingBanner(null);
      setBannerForm({ imageUrl: "", title: "", description: "", badge: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi cập nhật",
        description: error.message || "Không thể cập nhật banner",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteBanner = (id: string) => {
    setBannerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;

    try {
      await bannerService.deleteBanner(bannerToDelete);
      toast({
        title: "Thành công",
        description: "Xóa banner thành công",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi xóa banner",
        description: error.message || "Không thể xóa banner",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const handleToggleBanner = async (id: string) => {
    try {
      await bannerService.toggleBannerStatus(id);
      toast({
        title: "Thành công",
        description: "Thay đổi trạng thái banner thành công",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thay đổi trạng thái",
        variant: "destructive",
      });
    }
  };

  const startEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      imageUrl: banner.imageUrl,
      title: banner.title || "",
      description: banner.description || "",
      badge: banner.badge || "",
    });
  };

  const cancelEditBanner = () => {
    setEditingBanner(null);
    setBannerForm({ imageUrl: "", title: "", description: "", badge: "" });
  };

  // Settings handlers
  const handleUpdateSettings = async (category: string, settingsData: Record<string, string>) => {
    try {
      const settingsArray = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value,
        category,
      }));

      await systemSettingService.bulkUpsertSettings(settingsArray);
      toast({
        title: "Thành công",
        description: `Cập nhật cài đặt ${category} thành công`,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi cập nhật",
        description: error.message || "Không thể cập nhật cài đặt",
        variant: "destructive",
      });
    }
  };

  const handleInitializeDefaults = async () => {
    setInitDialogOpen(true);
  };
  
  const performInitializeDefaults = async () => {
    try {
      await systemSettingService.initializeDefaultSettings();
      toast({
        title: "Thành công",
        description: "Khởi tạo cài đặt mặc định thành công",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể khởi tạo cài đặt",
        variant: "destructive",
      });
    } finally {
      setInitDialogOpen(false);
    }
  };

  return (
    <AdminLayout title="Cài đặt Hệ thống">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Banner Management */}
          <div className="space-y-6">
            {/* Banner Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">{editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}</CardTitle>
                <CardDescription className="text-gray-600">Quản lý banner hiển thị trên trang chủ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-gray-700">URL Ảnh *</Label>
                  <Input
                    id="imageUrl"
                    placeholder="Link ảnh (JPG, PNG...)"
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">Tiêu đề</Label>
                  <Input
                    id="title"
                    placeholder="Tiêu đề banner"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Mô tả ngắn"
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge" className="text-gray-700">Nhãn</Label>
                  <Input
                    id="badge"
                    placeholder="Mới, Hot, Sale..."
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  {editingBanner ? (
                    <>
                      <Button onClick={handleUpdateBanner} className="flex-1 bg-blue-600 hover:bg-blue-700 !text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Cập nhật
                      </Button>
                      <Button onClick={cancelEditBanner} variant="outline" className="text-gray-700">
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleCreateBanner} className="w-full bg-blue-600 hover:bg-blue-700 !text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm Banner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Banner List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Danh sách Banner ({banners.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-700">Ảnh</TableHead>
                      <TableHead className="text-gray-700">Thông tin</TableHead>
                      <TableHead className="text-gray-700">Trạng thái</TableHead>
                      <TableHead className="text-gray-700">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="relative w-20 h-12 rounded overflow-hidden">
                            <Image src={banner.imageUrl} alt={banner.title || "Banner"} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {banner.title && <div className="font-medium text-sm text-gray-800">{banner.title}</div>}
                            {banner.description && <div className="text-xs text-gray-600">{banner.description}</div>}
                            {banner.badge && <Badge variant="secondary" className="text-xs">{banner.badge}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={banner.isActive ? "default" : "secondary"}>
                            {banner.isActive ? "Hiển thị" : "Ẩn"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-gray-700" onClick={() => startEditBanner(banner)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-700"
                              onClick={() => handleToggleBanner(banner.id)}
                            >
                              {banner.isActive ? "Ẩn" : "Hiện"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmDeleteBanner(banner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - System Settings */}
          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Thông tin chung</CardTitle>
                <CardDescription className="text-gray-600">Thông tin cơ bản về cửa hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name" className="text-gray-700">Tên cửa hàng</Label>
                  <Input
                    id="store_name"
                    value={generalSettings.store_name || ""}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, store_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_tagline" className="text-gray-700">Slogan</Label>
                  <Input
                    id="store_tagline"
                    value={generalSettings.store_tagline || ""}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, store_tagline: e.target.value })}
                  />
                </div>
                <Button onClick={() => handleUpdateSettings("general", generalSettings)} className="bg-green-600 hover:bg-green-700 !text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>

            {/* Contact Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Thông tin liên hệ</CardTitle>
                <CardDescription className="text-gray-600">Thông tin liên lạc với khách hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hotline" className="text-gray-700">Hotline</Label>
                  <Input
                    id="hotline"
                    value={contactSettings.hotline || ""}
                    onChange={(e) => setContactSettings({ ...contactSettings, hotline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactSettings.email || ""}
                    onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={contactSettings.address || ""}
                    onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                  />
                </div>
                <Button onClick={() => handleUpdateSettings("contact", contactSettings)} className="bg-green-600 hover:bg-green-700 !text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>

            {/* About Us */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Giới thiệu</CardTitle>
                <CardDescription className="text-gray-600">Nội dung trang About Us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about_us" className="text-gray-700">Nội dung giới thiệu</Label>
                  <Textarea
                    id="about_us"
                    rows={4}
                    value={aboutSettings.about_us || ""}
                    onChange={(e) => setAboutSettings({ ...aboutSettings, about_us: e.target.value })}
                  />
                </div>
                <Button onClick={() => handleUpdateSettings("about", aboutSettings)} className="bg-green-600 hover:bg-green-700 !text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Cài đặt kinh doanh</CardTitle>
                <CardDescription className="text-gray-600">Các thông số kinh doanh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate" className="text-gray-700">Thuế VAT (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={businessSettings.tax_rate || ""}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, tax_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_fee" className="text-gray-700">Phí giao hàng (VND)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    value={businessSettings.delivery_fee || ""}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, delivery_fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_order_amount" className="text-gray-700">Đơn hàng tối thiểu (VND)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={businessSettings.min_order_amount || ""}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, min_order_amount: e.target.value })}
                  />
                </div>
                <Button onClick={() => handleUpdateSettings("business", businessSettings)} className="bg-green-600 hover:bg-green-700 !text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>

            {/* Initialize Defaults */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Khởi tạo mặc định</CardTitle>
                <CardDescription className="text-gray-600">Khởi tạo các cài đặt mặc định nếu chưa có</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleInitializeDefaults} variant="outline" className="text-orange-600 border-orange-500 hover:bg-orange-50">
                  Khởi tạo cài đặt mặc định
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa banner</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBannerToDelete(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Init Confirmation Dialog */}
      <AlertDialog open={initDialogOpen} onOpenChange={setInitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khởi tạo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khởi tạo lại toàn bộ cài đặt mặc định? 
              <br/>
              Các cài đặt hiện tại sẽ được giữ nguyên nếu đã tồn tại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInitDialogOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={performInitializeDefaults}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Khởi tạo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

