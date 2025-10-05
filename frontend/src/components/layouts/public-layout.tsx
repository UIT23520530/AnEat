"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, MenuIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { CartSidebar } from "../cart/cart-sidebar";
import { Badge } from "../ui/badge";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname() || "/";
  const { openCart, cartItems } = useCart();
  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/customer/menu", label: "Thực đơn" },
    { href: "/customer/about-us", label: "Về chúng tôi" },
    { href: "/customer/contact-us", label: "Liên hệ" },
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
            <Link href="/" className="flex items-center gap-2">
              {/* <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  AE
                </span>
              </div> */}
                  <span className="font-bold text-4xl font-sigmar text-orange-500">
                  AnEat
                  </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base font-medium uppercase hover:text-primary transition-colors ${
                  isActive(item.href)
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <MapPin className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={openCart} className="relative">
              {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">
                {cartItemCount}
              </Badge>
              )}
              <ShoppingCart className="h-6 w-6" />
            </Button>
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
                size="lg"
                className="hidden sm:flex w-full sm:w-auto bg-orange-500 text-white rounded-full hover:bg-orange-600"
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
      <main className="flex-1">{children}</main>
      <CartSidebar />

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
                    href="/customer/contact-us"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Liên hệ
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
              <h4 className="font-semibold mb-4">Liên hệ</h4>
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
