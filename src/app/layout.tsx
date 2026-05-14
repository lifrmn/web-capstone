/**
 * ROOT LAYOUT
 * ===========
 * Layout utama aplikasi yang membungkus semua pages
 * Berfungsi sebagai wrapper untuk providers, fonts, dan global styles
 * 
 * Features:
 * - Inter font dari Google Fonts
 * - AuthProvider untuk NextAuth session management
 * - React Hot Toast untuk notifikasi global
 * - Custom toast styling (success, error, loading)
 * 
 * Metadata:
 * - Title: Sistem Penilaian Sekolah Dasar
 * - Description: Website untuk guru SD
 * - Language: Indonesian (id)
 */

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'

// === FONT CONFIGURATION ===
// Load Inter font dengan Latin subset
const inter = Inter({ subsets: ['latin'] })

// === METADATA ===
// SEO metadata untuk aplikasi
export const metadata: Metadata = {
  title: 'Sistem Penilaian Sekolah Dasar',
  description: 'Website untuk guru sekolah dasar dalam mengelola nilai siswa',
}

// === PROPS INTERFACE ===
interface RootLayoutProps {
  children: ReactNode  // Page content yang akan di-render
}

/**
 * ROOT LAYOUT COMPONENT
 * =====================
 * Component utama yang membungkus semua page di aplikasi
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">  {/* Set language ke Indonesian */}
      <body className={inter.className}>
        {/* AUTH PROVIDER: Menyediakan session context ke seluruh app */}
        <AuthProvider>
          {/* CHILDREN: Content dari page yang aktif */}
          {children}
          
          {/* TOASTER: Global toast notification system */}
          <Toaster
            position="top-center"  // Posisi toast di tengah atas
            toastOptions={{
              duration: 4000,  // 4 detik auto-dismiss
              // Default styling
              style: {
                background: '#fff',
                color: '#363636',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                maxWidth: '400px',
                textAlign: 'center'
              },
              // Success toast (hijau)
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }
              },
              // Error toast (merah)
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }
              },
              // Loading toast (biru)
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #dbeafe',
                }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}