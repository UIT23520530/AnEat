"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Calendar, Clock, Package, MapPin, Eye, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";

interface OrderItemOptionResponse {
  id: string;
  optionName: string;
  optionPrice: number;
}

interface OrderItemResponse {
  id: string;
  quantity: number;
  price: number; // Giá tính theo cent
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
  };
  options?: OrderItemOptionResponse[];
}

interface OrderResponse {
  id: string;
  orderNumber: string;
  total: number; // Tổng tiền tính theo cent
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  deliveryAddress: string | null;
  deliveryPhone: string | null;
  createdAt: string;
  items: OrderItemResponse[];
  branch: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
}

interface OrdersResponse {
  success: boolean;
  code: number;
  message: string;
  data: OrderResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
}

interface OrderItemOption {
  name: string;
  price: number;
}

interface Order {
  id: string;
  date: string;
  time: string;
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled";
  statusText: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    options?: OrderItemOption[];
  }>;
  address: string;
  phone: string;
}

// Fallback orders nếu API fail
const fallbackOrders: Order[] = [
  {
    id: "000120304",
    date: "09/06/2025",
    time: "09:00 PM",
    status: "pending",
    statusText: "Chờ xác nhận",
    total: 297900,
    items: [
      { name: "Combo Gà Rán", quantity: 2, price: 97900 },
      { name: "Burger Phô Mai", quantity: 1, price: 75900 },
      { name: "Khoai Tây Chiên", quantity: 2, price: 38500 },
    ],
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    phone: "0123456789",
  },
];

// Helper function để map OrderStatus từ backend sang frontend
const mapOrderStatus = (
  status: OrderResponse["status"]
): { status: Order["status"]; statusText: string } => {
  switch (status) {
    case "PENDING":
      return { status: "pending", statusText: "Chờ xác nhận" };
    case "PREPARING":
      return { status: "preparing", statusText: "Đang chuẩn bị" };
    case "READY":
      return { status: "delivering", statusText: "Sẵn sàng" };
    case "COMPLETED":
      return { status: "completed", statusText: "Hoàn thành" };
    case "CANCELLED":
      return { status: "cancelled", statusText: "Đã hủy" };
    default:
      return { status: "pending", statusText: "Chờ xác nhận" };
  }
};

// Helper function để format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Helper function để format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Map API response sang Order format
const mapToOrder = (apiOrder: OrderResponse): Order => {
  const { status, statusText } = mapOrderStatus(apiOrder.status);

  // Format items với options
  const items = apiOrder.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price, // Giá đã là VND
    options: item.options?.map((opt) => ({
      name: opt.optionName,
      price: opt.optionPrice,
    })),
  }));

  // Lấy address từ deliveryAddress hoặc branch address
  const address = apiOrder.deliveryAddress || apiOrder.branch.address;

  // Lấy phone từ deliveryPhone hoặc customer hoặc branch
  const phone = apiOrder.deliveryPhone || apiOrder.customer?.phone || apiOrder.branch.phone;

  return {
    id: apiOrder.orderNumber,
    date: formatDate(apiOrder.createdAt),
    time: formatTime(apiOrder.createdAt),
    status: status,
    statusText: statusText,
    total: apiOrder.total, // Giá đã là VND
    items: items,
    address: address,
    phone: phone,
  };
};

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
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      // Kiểm tra user đã đăng nhập chưa
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        setError("Vui lòng đăng nhập để xem đơn hàng của bạn");
        setOrders([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<OrdersResponse>("/home/orders", {
          params: {
            page: 1,
            limit: 50,
          },
        });

        if (response.data.success && response.data.data) {
          const mappedOrders = response.data.data.map(mapToOrder);
          setOrders(mappedOrders);
        } else {
          setError("Không thể tải đơn hàng");
          setOrders([]);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        
        // Lấy message từ backend nếu có
        const errorMessage = err.response?.data?.message || err.message;
        
        // Nếu lỗi do chưa đăng nhập hoặc không có quyền
        if (err.response?.status === 400 || err.response?.status === 401) {
          setError(errorMessage || "Vui lòng đăng nhập để xem đơn hàng của bạn");
        } else {
          setError(errorMessage || "Đã xảy ra lỗi khi tải đơn hàng");
        }
        
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <PublicLayout>
      <div className="bg-[#FFF9F2] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">ĐƠN HÀNG CỦA TÔI</h1>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="py-12">
              <CardContent className="text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">{error}</p>
                {error.includes("đăng nhập") && (
                  <Link href="/auth/login">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Đăng nhập ngay
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        Đơn hàng #{order.id}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-base">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {order.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {order.time}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${getStatusColor(order.status)} text-white text-base px-4 py-2`}
                    >
                      {order.statusText}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-500" />
                        Chi tiết đơn hàng
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead className="text-center">SL</TableHead>
                            <TableHead className="text-right">Giá</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                <div>
                                  <p>{item.name}</p>
                                  {item.options && item.options.length > 0 && (
                                    <div className="mt-1 space-y-0.5">
                                      {item.options.map((opt, idx) => (
                                        <p key={idx} className="text-xs text-gray-500">
                                          + {opt.name} {opt.price > 0 && <span className="text-orange-500">(+{opt.price.toLocaleString("vi-VN")}₫)</span>}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {(item.price * item.quantity).toLocaleString(
                                  "vi-VN",
                                )}
                                ₫
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Tổng cộng:</span>
                          <span className="text-red-600">
                            {order.total.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        Thông tin giao hàng
                      </h3>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Địa chỉ:
                          </p>
                          <p className="font-medium">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Số điện thoại:
                          </p>
                          <p className="font-medium">{order.phone}</p>
                        </div>
                      </div>
                      <Link href={`/customer/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          className="w-full mt-4 border-orange-500 text-orange-500 hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Bạn chưa có đơn hàng nào
                </p>
                <Link href="/customer/menu">
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                    Đặt hàng ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
