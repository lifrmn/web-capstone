/**
 * LOGIN PAGE
 * ==========
 * Halaman login untuk guru dengan design modern split-screen
 * 
 * Features:
 * - Email dan password authentication
 * - Show/hide password toggle
 * - Loading state saat submit
 * - Error handling dengan display
 * - Hero section dengan informasi aplikasi
 * - Responsive design (mobile-friendly)
 * 
 * Layout:
 * - Left side (Desktop): Hero section dengan gradient background
 * - Right side: Login form
 * 
 * Client Component: Yes (menggunakan state dan form handling)
 */

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Mail, Lock, ArrowRight, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  // === STATE MANAGEMENT ===
  const [email, setEmail] = useState('')                    // Email input
  const [password, setPassword] = useState('')              // Password input
  const [showPassword, setShowPassword] = useState(false)   // Show/hide password toggle
  const [isLoading, setIsLoading] = useState(false)         // Loading state untuk submit
  const [error, setError] = useState('')                    // Error message
  const router = useRouter()

  /**
   * HANDLE SUBMIT
   * =============
   * Handler untuk login form submission
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Set loading state
   * 3. Call NextAuth signIn dengan credentials
   * 4. Handle response (success: redirect, error: show message)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // NextAuth signIn dengan credentials provider
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false  // Manual redirect handling
      })

      if (result?.error) {
        // Login gagal: Tampilkan error
        setError('Email atau password salah')
      } else {
        // Login sukses: Redirect ke dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      // Network error atau error lainnya
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // === RENDER COMPONENT ===
  return (
    <div className="min-h-screen flex">
      {/* === LEFT SIDE: HERO SECTION === */}
      {/* Hanya tampil di desktop (lg:flex) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern - Decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Logo and Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sekolah App</h1>
              <p className="text-blue-100 text-sm">Sistem Penilaian SD</p>
            </div>
          </div>
        </div>

        {/* Main Content - Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Kelola Nilai Siswa<br />Dengan Lebih Mudah
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Platform digital untuk membantu guru dalam mengelola data nilai siswa secara efisien dan terorganisir.
          </p>
          
          {/* Feature List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mt-1">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Kelola Mata Pelajaran</h3>
                <p className="text-blue-100 text-sm">Atur semua mata pelajaran dengan mudah</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mt-1">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Input Nilai Praktis</h3>
                <p className="text-blue-100 text-sm">Interface seperti Excel untuk input cepat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Copyright */}
        <div className="relative z-10">
          <p className="text-blue-100 text-sm">
            © 2025 SD Inpres No. 125 Allu. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sekolah App</h1>
              <p className="text-gray-600 text-sm">Sistem Penilaian SD</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-base">
                Masuk ke akun Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <span className="font-medium">⚠</span>
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Memproses...
                    </div>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Belum punya akun?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    Daftar di sini
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-8">
            Dengan masuk, Anda menyetujui syarat dan ketentuan yang berlaku
          </p>
        </div>
      </div>
    </div>
  )
}