"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  Heart,
  User,
  ChevronDown,
  LogOut,
  Bell,
  Settings,
  Wallet,
  Gift,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setOpen(false);
  };

  const navLinks = [
    { href: "/buy", label: "Buy used car" },
    { href: "/sell", label: "Sell car" },
    { href: "/loans", label: "Car finance" },
    { href: "/maintenance", label: "Maintenance" },
    { href: "/car-check", label: "Car services" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="bg-blue-600 text-white font-extrabold text-lg px-3 py-1 rounded-md tracking-tight">
            CARS
          </span>
          <span className="text-orange-500 font-extrabold text-lg ml-0.5">
            24
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === link.href ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>

          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/wallet"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                Wallet
              </Link>

              <Link
                href="/referrals"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                <Gift className="h-4 w-4" />
                Refer & Earn
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  Account
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <User className="h-4 w-4" />
              Account
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          {user && (
            <Link
              href="/notifications"
              className="relative p-2 text-gray-700 hover:text-blue-600"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 cursor-pointer">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-lg font-bold">
                <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-md">
                  CARS
                </span>
                <span className="text-orange-500 font-extrabold ml-0.5">24</span>
              </SheetTitle>
              <div className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-2" />
                {user ? (
                  <>
                    <Link
                      href="/notifications"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/wallet"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Wallet className="h-4 w-4" />
                      My Wallet
                    </Link>
                    <Link
                      href="/referrals"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Gift className="h-4 w-4" />
                      Refer & Earn
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <Button
                      variant="destructive"
                      className="mt-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
