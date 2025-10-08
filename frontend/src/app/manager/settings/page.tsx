"use client"

import { ManagerLayout } from "@/components/layouts/manager-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt cửa hàng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và cấu hình cho cửa hàng của bạn.
          </p>
        </div>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cửa hàng</CardTitle>
            <CardDescription>
              Cập nhật thông tin chi tiết của cửa hàng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Tên cửa hàng</Label>
              <Input id="store-name" defaultValue="AnEat - Chi nhánh Quận 1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Địa chỉ</Label>
              <Input
                id="store-address"
                defaultValue="123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Số điện thoại</Label>
              <Input id="store-phone" defaultValue="0987 654 321" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Mô tả</Label>
              <Textarea
                id="store-description"
                defaultValue="Chuyên các món ăn nhanh, giao hàng tận nơi."
              />
            </div>
            <Button>Lưu thay đổi</Button>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Giờ hoạt động</CardTitle>
            <CardDescription>Cài đặt thời gian mở và đóng cửa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label>Thứ 2 - Thứ 6</Label>
              <Input type="time" defaultValue="08:00" />
              <Input type="time" defaultValue="22:00" />
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label>Thứ 7 - Chủ nhật</Label>
              <Input type="time" defaultValue="09:00" />
              <Input type="time" defaultValue="23:00" />
            </div>
            <Button>Lưu giờ hoạt động</Button>
          </CardContent>
        </Card>

        {/* Store Services */}
        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ tại cửa hàng</CardTitle>
            <CardDescription>
              Bật hoặc tắt các dịch vụ có sẵn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Giao hàng</Label>
                <p className="text-sm text-muted-foreground">
                  Cho phép khách hàng đặt giao hàng tận nơi.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Đặt bàn</Label>
                <p className="text-sm text-muted-foreground">
                  Cho phép khách hàng đặt bàn trước.
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thanh toán trực tuyến</Label>
                <p className="text-sm text-muted-foreground">
                  Chấp nhận thanh toán qua thẻ và ví điện tử.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}
