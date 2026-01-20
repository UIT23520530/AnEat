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
  Wallet,
} from "lucide-react";

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
    case "ready":
      return "bg-green-500 text-white";
    case "completed":
      return "bg-green-600";
    case "cancelled":
      return "bg-red-500";
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
    total: number;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        image: string | null;
      };
      options?: Array<{
        id: string;
        optionName: string;
        optionPrice: number;
      }>;
      notes?: string;
    }>;
    branch: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
    customer: {
      name: string;
      phone: string;
    } | null;
    deliveryAddress: string | null;
    deliveryPhone: string | null;
    orderType: "DELIVERY" | "PICKUP";
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

        const response = await apiClient.get<OrderTrackingResponse>(
          `/home/orders/${id}/tracking`
        );

        if (response.data.success && response.data.data) {
          const orderData = response.data.data;
          
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
            total: orderData.total,
            subtotal: orderData.total,
            tax: 0,
            discount: 0,
            items: orderData.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes || "",
              options: item.options?.map(opt => ({
                name: opt.optionName,
                price: opt.optionPrice
              }))
            })),
            customer: {
              name: orderData.customer?.name || "Khách hàng",
              phone: orderData.deliveryPhone || orderData.customer?.phone || "Liên hệ qua app",
              address: orderData.deliveryAddress || (orderData.orderType === "PICKUP" ? "Nhận tại nhà hàng" : "Chưa có địa chỉ"),
            },
            orderType: orderData.orderType,
            paymentMethod: orderData.paymentMethod || "CASH",
            branch: orderData.branch
          };

          setOrder(mappedOrder);
        } else {
          setError("Không tìm thấy đơn hàng");
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.response?.status === 404 ? "Không tìm thấy đơn hàng" : "Đã xảy ra lỗi khi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const mapStatusText = (status: string): string => {
    switch (status) {
      case "PENDING": return "Chờ xác nhận";
      case "PREPARING": return "Đang chuẩn bị";
      case "READY": return "Sẵn sàng";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return "Chờ xác nhận";
    }
  };

  const getStatusStep = (status: string): number => {
    switch (status) {
      case "PENDING": return 0;
      case "PREPARING": return 1;
      case "READY": return 2;
      case "COMPLETED": return 3;
      default: return 0;
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
    return (
      <PublicLayout>
        <div className="bg-[#FFF9F2] min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rất tiếc!</h2>
          <p className="text-gray-600 mb-6">{error || "Không tìm thấy đơn hàng"}</p>
          <Button onClick={() => window.location.href = '/customer/orders'} className="bg-orange-500">
            Xem danh sách đơn hàng
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-[#FFF9F2] min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                  Đơn hàng #{order.id}
                </h1>
                <div className="flex items-center gap-4 text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {order.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {order.time}
                  </span>
                </div>
              </div>
              <Badge
                className={`${getStatusColor(order.status)} text-white text-base md:text-lg px-6 py-2 rounded-full shadow-sm`}
              >
                {order.statusText}
              </Badge>
            </div>
          </div>

          {/* Order Progress */}
          <Card className="mb-6 border-none shadow-premium overflow-hidden bg-white rounded-xl">
            <CardHeader className="py-2 pb-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-3">
              <div className="relative max-w-2xl mx-auto px-2">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 rounded-full mx-6">
                  <div
                    className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_8px_rgba(249,115,22,0.4)] rounded-full"
                    style={{
                      width: `${(order.currentStep / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= order.currentStep;
                    const isCurrent = index === order.currentStep;

                    return (
                      <div key={index} className="flex flex-col items-center w-20">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 z-10 ${
                            isCompleted
                              ? "bg-orange-500 text-white shadow-md font-bold"
                              : "bg-white border-2 border-gray-100 text-gray-300"
                          } ${isCurrent ? "ring-2 ring-orange-100 scale-105" : ""}`}
                        >
                          <Icon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                        </div>
                        <p
                          className={`font-bold text-center text-[10px] md:text-[11px] whitespace-nowrap transition-colors ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branch Info */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chi nhánh phục vụ</p>
                    <p className="font-bold text-gray-800">{order.branch.name}</p>
                    <p className="text-sm text-gray-600">{order.branch.address}</p>
                    {order.branch.phone && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.branch.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8 text-white">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="border-none shadow-premium rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                      <User className="h-5 w-5 text-orange-500" />
                      Thông tin {order.orderType === "PICKUP" ? "nhận món" : "giao hàng"}
                    </CardTitle>
                    <Badge variant="outline" className="border-orange-200 text-orange-600 bg-white">
                      {order.orderType === "PICKUP" ? "Đến lấy" : "Giao hàng"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Người nhận</p>
                        <p className="font-bold text-gray-800 text-lg">{order.customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                        <p className="font-bold text-gray-800 text-lg">{order.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-50">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {order.orderType === "PICKUP" ? "Địa chỉ nhà hàng" : "Địa chỉ giao hàng"}
                      </p>
                      <p className="font-bold text-gray-800 leading-relaxed">
                        {order.orderType === "PICKUP" ? order.branch.address : order.customer.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="border-none shadow-premium rounded-2xl overflow-hidden bg-white text-white">
                <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                  <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                    <Package className="h-5 w-5 text-orange-500" />
                    Chi tiết món ăn
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-white">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-none">
                        <TableHead className="font-bold text-gray-700">MÓN ĂN</TableHead>
                        <TableHead className="text-center font-bold text-gray-700 w-24">SỐ LƯỢNG</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">ĐƠN GIÁ</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">THÀNH TIỀN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item: any, index: number) => (
                        <TableRow key={index} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                          <TableCell className="py-4">
                            <div>
                              <p className="font-bold text-gray-800">{item.name}</p>
                              {item.options && item.options.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                  {item.options.map((opt: any, idx: number) => (
                                    <p key={idx} className="text-[11px] text-gray-500 flex items-center gap-1">
                                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                      {opt.name} (+{opt.price.toLocaleString("vi-VN")}₫)
                                    </p>
                                  ))}
                                </div>
                              )}
                              {item.notes && (
                                <div className="mt-2 text-xs bg-gray-50 p-2 rounded-md border border-gray-100 text-gray-600">
                                  <span className="font-bold text-gray-400 uppercase text-[10px] mr-2">Ghi chú:</span>
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-gray-700">
                            x{item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-gray-600 font-medium">
                            {item.price.toLocaleString("vi-VN")}₫
                          </TableCell>
                          <TableCell className="text-right font-bold text-orange-600">
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
              <div className="sticky top-8 space-y-6">
                <Card className="border-none shadow-premium rounded-2xl overflow-hidden bg-white text-white">
                  <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                    <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                      <FileText className="h-5 w-5 text-orange-500" />
                      Tóm tắt đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 font-medium">Tổng tiền món:</span>
                      <span className="font-bold text-gray-800 ">
                        {order.subtotal.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 font-medium">Giảm giá:</span>
                      <span className="font-bold text-green-600">
                        -{order.discount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-extrabold text-gray-900">TỔNG CỘNG:</span>
                      <span className="text-orange-500 text-2xl font-black">
                        {order.total.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Phương thức thanh toán</p>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          {order.paymentMethod === "CASH" ? (
                            <DollarSign className="h-5 w-5 text-green-500" />
                          ) : (
                            <Wallet className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        <span className="font-bold text-gray-700">
                          {order.paymentMethod === "CASH"
                            ? "Tiền mặt (COD)"
                            : order.paymentMethod === "E-WALLET" ? "Ví điện tử MoMo" : "Chuyển khoản / Khác"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 space-y-3">
                      {/* <Button className="w-full bg-orange-500 hover:bg-orange-600 shadow-orange-200 shadow-lg h-12 rounded-xl font-bold transition-all active:scale-[0.98]">
                        LIÊN HỆ HỖ TRỢ
                      </Button> */}
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/customer/menu'}
                        className="w-full border-gray-200 bg-orange-600 text-white h-12 rounded-xl font-bold hover:bg-gray-50"
                      >
                        TIẾP TỤC MUA SẮM
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// Additional Icon needed
function DollarSign(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
