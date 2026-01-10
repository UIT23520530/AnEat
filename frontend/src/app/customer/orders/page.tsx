"use client";

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
import { Calendar, Clock, Package, MapPin, Eye } from "lucide-react";

const orders = [
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
  {
    id: "000120303",
    date: "08/06/2025",
    time: "07:30 PM",
    status: "preparing",
    statusText: "Đang chuẩn bị",
    total: 186900,
    items: [
      { name: "Mỳ Ý Carbonara", quantity: 2, price: 93500 },
    ],
    address: "456 Đường DEF, Phường UVW, Quận 3, TP.HCM",
    phone: "0987654321",
  },
  {
    id: "000120302",
    date: "07/06/2025",
    time: "06:15 PM",
    status: "delivering",
    statusText: "Đang giao hàng",
    total: 154800,
    items: [
      { name: "Burger Bò Cổ Điển", quantity: 2, price: 64900 },
      { name: "Nước Ngọt", quantity: 2, price: 22000 },
    ],
    address: "789 Đường GHI, Phường RST, Quận 5, TP.HCM",
    phone: "0369852147",
  },
  {
    id: "000120301",
    date: "06/06/2025",
    time: "05:45 PM",
    status: "completed",
    statusText: "Hoàn thành",
    total: 195800,
    items: [
      { name: "Combo Gà Rán", quantity: 2, price: 97900 },
    ],
    address: "321 Đường JKL, Phường MNO, Quận 7, TP.HCM",
    phone: "0258963147",
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

export default function OrdersPage() {
  return (
    <PublicLayout>
      <div className="bg-[#FFF9F2] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">ĐƠN HÀNG CỦA TÔI</h1>
          </div>

          {/* Orders List */}
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
                                {item.name}
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

          {orders.length === 0 && (
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
