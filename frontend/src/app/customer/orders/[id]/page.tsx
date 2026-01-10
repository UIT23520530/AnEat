"use client";

import { PublicLayout } from "@/components/layouts/public-layout";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Package,
  MapPin,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Truck,
  ChefHat,
  ClipboardCheck,
} from "lucide-react";

const orderDetails = {
  "000120304": {
    id: "000120304",
    date: "09/06/2025",
    time: "09:00 PM",
    status: "pending",
    statusText: "Chờ xác nhận",
    currentStep: 0,
    total: 297900,
    subtotal: 270818,
    tax: 27082,
    discount: 0,
    items: [
      {
        name: "Combo Gà Rán",
        quantity: 2,
        price: 97900,
        notes: "Không hành",
      },
      {
        name: "Burger Phô Mai",
        quantity: 1,
        price: 75900,
        notes: "Thêm rau",
      },
      {
        name: "Khoai Tây Chiên",
        quantity: 2,
        price: 38500,
        notes: "",
      },
    ],
    customer: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    },
    paymentMethod: "COD",
  },
};

const statusSteps = [
  {
    icon: ClipboardCheck,
    label: "Chờ xác nhận",
    description: "Đơn hàng đang chờ xác nhận",
  },
  {
    icon: ChefHat,
    label: "Đang chuẩn bị",
    description: "Nhà hàng đang chuẩn bị món ăn",
  },
  {
    icon: Truck,
    label: "Đang giao hàng",
    description: "Shipper đang trên đường giao hàng",
  },
  {
    icon: CheckCircle2,
    label: "Hoàn thành",
    description: "Đơn hàng đã được giao thành công",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "preparing":
      return "bg-blue-500";
    case "delivering":
      return "bg-purple-500";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = orderDetails[params.id as keyof typeof orderDetails];

  if (!order) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="bg-[#FFF9F2] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Đơn hàng #{order.id}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {order.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {order.time}
                  </span>
                </div>
              </div>
              <Badge
                className={`${getStatusColor(order.status)} text-white text-lg px-6 py-2`}
              >
                {order.statusText}
              </Badge>
            </div>
          </div>

          {/* Order Progress */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Trạng thái đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-orange-500 transition-all duration-500"
                    style={{
                      width: `${(order.currentStep / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="relative grid grid-cols-4 gap-4">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= order.currentStep;
                    const isCurrent = index === order.currentStep;

                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                            isCompleted
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-orange-200" : ""}`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <p
                          className={`font-semibold text-center mb-1 ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-center text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-500" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Họ tên</p>
                      <p className="font-medium text-lg">{order.customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Số điện thoại
                      </p>
                      <p className="font-medium text-lg">
                        {order.customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium text-lg">
                        {order.customer.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    Chi tiết đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên món</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Giá (VAT)</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && (
                                <p className="text-sm text-muted-foreground">
                                  Ghi chú: {item.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.price.toLocaleString("vi-VN")}₫
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-4">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Tổng quan đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Thành tiền:</span>
                    <span className="font-medium">
                      {order.subtotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span className="font-medium text-green-600">
                      -{order.discount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-red-600 text-2xl">
                        {order.total.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Phương thức thanh toán:
                    </p>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {order.paymentMethod === "COD"
                        ? "Thanh toán khi nhận hàng"
                        : "Thanh toán online"}
                    </Badge>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                    Liên hệ hỗ trợ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
