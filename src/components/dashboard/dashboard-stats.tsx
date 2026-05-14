/**
 * DASHBOARD STATS COMPONENT
 * =========================
 * Client component untuk menampilkan statistik dashboard dengan visualisasi
 * 
 * Client Component: Yes (interactive features, toast, dynamic imports)
 * 
 * Features:
 * - Stats cards dengan gradient colors
 * - Quick actions (tambah mapel, lihat siswa, export Excel)
 * - Alert untuk siswa belum dinilai
 * - Grade distribution visualization
 * - Top students leaderboard
 * - Students yang perlu attention
 * - Export Excel functionality
 * - Lazy loaded charts untuk performance
 * 
 * Props:
 * - subjectCount: Jumlah mata pelajaran
 * - studentCount: Total student entries
 * - overallAverage: Rata-rata nilai keseluruhan
 * - passPercentage: Persentase siswa lulus
 * - subjectAverages: Array rata-rata per subject
 * - gradeDistribution: Distribusi A, B, C, D, E
 * - topStudents: Top 5 siswa berprestasi
 * - needsAttention: Siswa dengan nilai rendah
 * - ungradedCount: Jumlah siswa belum dinilai
 * - teacherName: Nama guru untuk greeting
 * 
 * Performance:
 * - Dynamic import untuk charts (code splitting)
 * - SSR disabled untuk charts (client-only rendering)
 * - Loading skeleton saat charts loading
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen,      // Icon mata pelajaran
  Users,         // Icon siswa
  TrendingUp,    // Icon trending
  Award,         // Icon prestasi
  Download,      // Icon download
  UserPlus,      // Icon tambah siswa
  PlusCircle,    // Icon tambah
  AlertCircle,   // Icon warning
  CheckCircle,   // Icon success
  TrendingDown,  // Icon trending down
  Brain          // Icon intelligence
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// === DYNAMIC IMPORT FOR CHARTS ===
// Lazy load charts untuk performance optimization
// Charts hanya di-load saat diperlukan (code splitting)
const DashboardCharts = dynamic(() => import('./dashboard-charts'), {
  loading: () => <div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>,
  ssr: false  // Disable SSR karena charts pakai window object
})

// === INTERFACE DEFINITION ===
// Props untuk DashboardStats component
interface DashboardStatsProps {
  subjectCount: number          // Total mata pelajaran
  studentCount: number          // Total student entries
  overallAverage: number        // Rata-rata nilai keseluruhan
  passPercentage: number        // Persentase siswa lulus (>=60)
  subjectAverages: Array<{      // Rata-rata per subject
    name: string
    average: number
  }>
  gradeDistribution: {          // Distribusi nilai
    A: number  // 90-100
    B: number  // 75-89
    C: number  // 60-74
    D: number  // 50-59
    E: number  // <50
  }
  topStudents: Array<{          // Top 5 siswa
    name: string
    score: number
    subjectName: string
  }>
  needsAttention: Array<{       // Siswa nilai rendah
    name: string
    score: number
    subjectName: string
  }>
  ungradedCount: number         // Siswa belum dinilai
  teacherName: string           // Nama guru
}

/**
 * DASHBOARD STATS COMPONENT
 * =========================
 * Main component untuk display statistik
 */
export default function DashboardStats({ 
  subjectCount, 
  studentCount, 
  overallAverage,
  passPercentage,
  subjectAverages,
  gradeDistribution,
  topStudents,
  needsAttention,
  ungradedCount,
  teacherName
}: DashboardStatsProps) {
  // === CALCULATE TOTALS ===
  // Hitung total siswa yang sudah dinilai
  const totalGrades = Object.values(gradeDistribution).reduce((sum, count) => sum + count, 0)

  /**
   * HANDLE EXPORT EXCEL
   * ===================
   * Handler untuk export semua data ke Excel
   * 
   * Flow:
   * 1. Show loading toast
   * 2. Fetch dari API endpoint /api/dashboard/export-excel
   * 3. Convert response to blob
   * 4. Trigger download dengan dynamic filename
   * 5. Show success/error toast
   */
  const handleExportExcel = async () => {
    try {
      // Step 1: Show loading indicator
      toast.loading('Mengekspor data ke Excel...', { id: 'export-excel' })
      
      // Step 2: Fetch Excel file dari API
      const response = await fetch('/api/dashboard/export-excel')
      
      // Step 3: Error handling
      if (!response.ok) {
        throw new Error('Gagal mengekspor data')
      }
      
      // Step 4: Convert response to blob (binary file)
      const blob = await response.blob()
      
      // Step 5: Create download link dan trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Dynamic filename dengan timestamp
      a.download = `Laporan_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()  // Trigger download
      
      // Step 6: Cleanup - revoke object URL dan remove element
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Step 7: Show success message
      toast.success('File Excel berhasil didownload', { id: 'export-excel' })
    } catch (error) {
      // Error handling dengan log dan toast
      console.error('Export Excel error:', error)
      toast.error('Gagal mengekspor data ke Excel', { id: 'export-excel' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header dengan sambutan */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Selamat Datang, {teacherName}!</h1>
        <p className="text-blue-100 text-lg">Kelola mata pelajaran dan nilai siswa Anda di sini.</p>
      </div>

      {/* Notifikasi & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifikasi */}
        {ungradedCount > 0 && (
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-amber-900">Perhatian!</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {ungradedCount} siswa belum dinilai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link href="/dashboard/subjects/new">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span className="text-xs">Tambah Mapel</span>
                </Button>
              </Link>
              <Link href="/dashboard/siswa">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <UserPlus className="h-5 w-5" />
                  <span className="text-xs">Lihat Siswa</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col gap-2"
                onClick={handleExportExcel}
              >
                <Download className="h-5 w-5" />
                <span className="text-xs">Export Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Mata Pelajaran</p>
                <p className="text-4xl font-bold mt-2">{subjectCount}</p>
                <p className="text-blue-100 text-xs mt-1">Mata pelajaran yang Anda ajar</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-200 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Siswa</p>
                <p className="text-4xl font-bold mt-2">{studentCount}</p>
                <p className="text-green-100 text-xs mt-1">Siswa di semua mata pelajaran</p>
              </div>
              <Users className="h-12 w-12 text-green-200 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Rata-rata Nilai</p>
                <p className="text-4xl font-bold mt-2">{overallAverage.toFixed(1)}</p>
                <p className="text-purple-100 text-xs mt-1">Nilai rata-rata keseluruhan</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-200 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Persentase Kelulusan</p>
                <p className="text-4xl font-bold mt-2">{passPercentage}%</p>
                <p className="text-amber-100 text-xs mt-1">Siswa dengan nilai ≥ 75</p>
              </div>
              <Award className="h-12 w-12 text-amber-200 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafik Section - Lazy Loaded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>}>
          <DashboardCharts 
            gradeDistribution={gradeDistribution}
            subjectAverages={subjectAverages}
          />
        </Suspense>
      </div>

      {/* Tabel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Siswa Berprestasi */}
        <Card className="shadow-lg border-t-4 border-t-green-500">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Award className="h-5 w-5 text-green-600" />
              Siswa Berprestasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {topStudents.length > 0 ? (
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold shadow-md">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">{student.score.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada data siswa berprestasi</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Siswa Perlu Perhatian */}
        <Card className="shadow-lg border-t-4 border-t-red-500">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Siswa Perlu Perhatian
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {needsAttention.length > 0 ? (
              <div className="space-y-3">
                {needsAttention.map((student, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-bold shadow-md">
                      !
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-bold text-red-600">{student.score.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                <p className="text-green-600 font-medium">Semua siswa sudah baik!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rekomendasi AI */}
      {needsAttention.length > 0 && (
        <Card className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 rounded-full p-3 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg mb-2">💡 Rekomendasi AI</h3>
                <p className="text-blue-800 leading-relaxed">
                  Terdapat <strong>{needsAttention.length} siswa</strong> yang membutuhkan perhatian khusus dengan nilai di bawah 75. 
                  Disarankan untuk memberikan bimbingan tambahan atau remedial untuk meningkatkan pemahaman mereka.
                </p>
                {ungradedCount > 0 && (
                  <p className="text-blue-700 mt-2">
                    Juga terdapat <strong>{ungradedCount} siswa</strong> yang belum memiliki nilai. Pastikan untuk melengkapi penilaian.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}