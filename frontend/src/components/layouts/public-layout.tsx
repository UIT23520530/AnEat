"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, MenuIcon, MapPin, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useBranch } from "@/contexts/branch-context";
import { CartSidebar } from "../cart/cart-sidebar";
import { BranchSelectorDialog } from "../branch/branch-selector-dialog";
import { Badge } from "../ui/badge";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname() || "/";
  const { openCart, cartItems } = useCart();
  const { openBranchSelector, selectedBranch } = useBranch();
  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/customer/menu", label: "Thực đơn" },
    { href: "/customer/promotions", label: "Khuyến mãi" },
    { href: "/customer/orders", label: "Đơn hàng" },
    { href: "/customer/about-us", label: "Về chúng tôi" },
    { href: "/customer/stores", label: "Cửa hàng" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex flex-col items-center gap-1">
              <img
                src="/icons/AnEat.svg"
                alt="AnEat"
                className="h-8 w-8"
              />
              <span className="font-bold text-2xl font-sigmar text-orange-500">
                AnEat
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base uppercase transition-colors ${
                  isActive(item.href)
                    ? "text-orange-500 font-bold border-b-2 border-orange-500 pb-1"
                    : "text-muted-foreground font-medium hover:text-orange-500"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Button chọn cửa hàng */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openBranchSelector}
              title={selectedBranch ? selectedBranch.name : "Chọn cửa hàng"}
              className="relative"
            >
              <Store className="h-6 w-6" />
              {selectedBranch && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 border-2 border-white" />
              )}
            </Button>
            {/* Button cart */}
            <Button variant="ghost" size="icon" onClick={openCart} className="relative">
              {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0 text-xs rounded-full bg-red-500 text-white">
                {cartItemCount}
              </Badge>
              )}
              <ShoppingBag className="h-6 w-6" />
            </Button>

            {/* Button user */}
            <Link href="/auth/login">
              <Button
                size="lg"
                className="hidden sm:flex w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600"
              >
                Đăng nhập
              </Button>
            </Link>
            <Link href="/auth/register">
                <Button
                variant="outline"
                size="lg"
                className="hidden sm:flex w-full sm:w-auto border-orange-500 text-orange-500 rounded-full hover:bg-orange-100 hover:text-orange-600"
                >
                Đăng ký
                </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-orange-50 flex-1">{children}</main>
      <CartSidebar />
      <BranchSelectorDialog />

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">AnEat</h3>
              <p className="text-sm text-muted-foreground">
                Đồ ăn nhanh ngon được giao đến tận nhà bạn.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Đường dẫn nhanh</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/customer/menu"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Thực đơn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/about-us"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/stores"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cửa hàng
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Khách hàng</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/profile"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Hồ sơ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/history"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Lịch sử đặt hàng
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/feedback"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Phản hồi
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cửa hàng</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Điện thoại: 1900 6522</li>
                <li>Email: info@aneat.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 AnEat. Đã đăng ký bản quyền.
          </div>
        </div>
      </footer>
    </div>
  );
}
