"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import AppLayout from "@/components/app-layout"
import { exportData, importData } from "@/lib/data-utils"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, changePassword } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ في تغيير كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
      })
      setIsLoading(false)
      return
    }

    try {
      const success = await changePassword(currentPassword, newPassword)
      if (success) {
        toast({
          title: "تم تغيير كلمة المرور",
          description: "تم تغيير كلمة المرور بنجاح",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في تغيير كلمة المرور",
          description: "كلمة المرور الحالية غير صحيحة",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء محاولة تغيير كلمة المرور",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!logoFile) {
      toast({
        variant: "destructive",
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار ملف الشعار أولاً",
      })
      return
    }

    setIsLoading(true)

    try {
      // This would call an API to upload the logo
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "تم تغيير الشعار",
          description: "تم تغيير شعار الموقع بنجاح",
        })
        setLogoFile(null)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء محاولة تغيير الشعار",
      })
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      await exportData()
      toast({
        title: "تم تصدير البيانات",
        description: "تم تصدير البيانات بنجاح",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء محاولة تصدير البيانات",
      })
    }
  }

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await importData(file)
      toast({
        title: "تم استيراد البيانات",
        description: "تم استيراد البيانات بنجاح",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء محاولة استيراد البيانات",
      })
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">تغيير كلمة المرور</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">تغيير شعار الموقع</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogoChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">اختر ملف الشعار الجديد</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setLogoFile(e.target.files[0])
                    }
                  }}
                />
              </div>
              <Button type="submit" disabled={isLoading || !logoFile}>
                {isLoading ? "جاري التغيير..." : "تغيير الشعار"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">إدارة البيانات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importData">استيراد بيانات</Label>
              <Input id="importData" type="file" accept=".json" onChange={handleImportData} />
            </div>
            <Button onClick={handleExportData}>تصدير نسخة احتياطية من البيانات</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
