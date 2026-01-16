"use client";

import { use, useEffect, useState } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { notFound } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Loader2 } from "lucide-react";
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

interface OrderTrackingResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    orderNumber: string;
    status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
    total: number; // cent
    items: Array<{
      id: string;
      quantity: number;
      price: number; // cent
      product: {
        id: string;
        name: string;
        image: string | null;
      };
      options?: Array<{
        id: string;
        optionName: string;
        optionPrice: number; // cent
      }>;
    }>;
    branch: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    estimatedTime: string | null;
    paymentStatus: string;
    paymentMethod: string | null;
  };
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        // id có thể là orderNumber hoặc order ID
        const response = await apiClient.get<OrderTrackingResponse>(
          `/home/orders/${id}/tracking`
        );

        if (response.data.success && response.data.data) {
          const orderData = response.data.data;
          
          // Map API response sang format cho UI
          const mappedOrder = {
            id: orderData.orderNumber,
            date: new Date(orderData.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            time: new Date(orderData.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            status: orderData.status.toLowerCase(),
            statusText: mapStatusText(orderData.status),
            currentStep: getStatusStep(orderData.status),
            total: orderData.total / 100, // Convert cent to VND
            subtotal: orderData.total / 100, // Simplified
            tax: 0,
            discount: 0,
            items: orderData.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price / 100, // Convert cent to VND
              notes: "", // Có thể thêm notes nếu có
            })),
            customer: {
              name: "Khách hàng", // Có thể lấy từ order nếu có
              phone: orderData.branch.phone,
              address: orderData.branch.address,
            },
            paymentMethod: orderData.paymentMethod || "COD",
          };

          setOrder(mappedOrder);
        } else {
          setError("Không tìm thấy đơn hàng");
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        if (err.response?.status === 404) {
          setError("Không tìm thấy đơn hàng");
        } else {
          setError("Đã xảy ra lỗi khi tải đơn hàng");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const mapStatusText = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PREPARING":
        return "Đang chuẩn bị";
      case "READY":
        return "Sẵn sàng";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Chờ xác nhận";
    }
  };

  const getStatusStep = (status: string): number => {
    switch (status) {
      case "PENDING":
        return 0;
      case "PREPARING":
        return 1;
      case "READY":
        return 2;
      case "COMPLETED":
        return 3;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="bg-[#FFF9F2] min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !order) {
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
          <Card className="mb-8">
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
              <Card>
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
              <Card>
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
              <Card className="sticky top-4">
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
