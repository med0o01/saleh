"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, X, Settings, LogOut, Package, Calculator } from "lucide-react"

// إعادة تنسيق الهيدر كما كان سابقاً
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/pricing" className="flex items-center">
              <Image src="/logo.png" alt="AlSaleh Aluminium" width={150} height={60} priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
            <Link href="/pricing">
              <Button variant={isActive("/pricing") ? "default" : "ghost"} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span>التسعير</span>
              </Button>
            </Link>
            <Link href="/products">
              <Button variant={isActive("/products") ? "default" : "ghost"} className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>المنتجات</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant={isActive("/settings") ? "default" : "ghost"} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>الإعدادات</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>تسجيل الخروج</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white border-t p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/pricing">
                  <Button
                    variant={isActive("/pricing") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calculator className="h-4 w-4 ml-2" />
                    <span>التسعير</span>
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <Button
                    variant={isActive("/products") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4 ml-2" />
                    <span>المنتجات</span>
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <Button
                    variant={isActive("/settings") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 ml-2" />
                    <span>الإعدادات</span>
                  </Button>
                </Link>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500"
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  <span>تسجيل الخروج</span>
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1 bg-gray-50">{children}</main>

      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} المنيوم الصالح - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
