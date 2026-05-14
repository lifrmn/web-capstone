/**
 * SUBJECTS LIST COMPONENT
 * =======================
 * Component untuk menampilkan daftar mata pelajaran dalam grid layout
 * 
 * Client Component: Yes (delete functionality, state management)
 * 
 * Features:
 * - Grid layout responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Subject cards dengan hover effects
 * - Edit dan delete actions
 * - Loading state saat delete
 * - Empty state dengan CTA
 * - Badge untuk semester (Ganjil/Genap)
 * - Student count display
 * - Confirmation dialog sebelum delete
 * - Auto reload setelah delete success
 * 
 * Props:
 * - subjects: Array of subject objects dengan student count
 * 
 * Subject Object Structure:
 * {
 *   id: string              - Unique identifier
 *   name: string            - Nama mata pelajaran
 *   semester: string|null   - 'Ganjil' atau 'Genap'
 *   _count: {               - Prisma aggregation
 *     students: number      - Jumlah siswa dalam subject
 *   }
 * }
 * 
 * State Management:
 * - deletingId: Track subject yang sedang di-delete (untuk loading indicator)
 * 
 * User Flow:
 * 1. View list of subjects in grid
 * 2. Click card → navigate to subject detail
 * 3. Click edit icon → navigate to edit form
 * 4. Click delete icon → show confirmation → delete
 * 5. Success → reload page to reflect changes
 */

'use client'

// === IMPORTS ===
import { useState } from 'react'  // Hook untuk manage delete loading state
import Link from 'next/link'  // Next.js Link untuk navigation
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'  // Card components
import { Button } from '@/components/ui/button'  // Button component
import { Badge } from '@/components/ui/badge'  // Badge untuk semester display
import { BookOpen, Users, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react'  // Icons
import toast from 'react-hot-toast'  // Toast notifications untuk feedback

// === TYPE DEFINITIONS ===

// Subject interface - matches data structure dari API
interface Subject {
  id: string                    // UUID dari database
  name: string                  // Nama mata pelajaran (e.g., "Matematika")
  semester: string | null       // 'Ganjil', 'Genap', atau null
  _count: { students: number }  // Prisma count aggregation
}

// Component props interface
interface SubjectsListProps {
  subjects: Subject[]  // Array of subjects untuk di-display
}

/**
 * SUBJECTS LIST COMPONENT
 * =======================
 * Main component function
 */
export default function SubjectsList({ subjects }: SubjectsListProps) {
  // === STATE MANAGEMENT ===
  
  // deletingId: Track ID of subject yang sedang di-delete
  // Purpose: Show loading spinner pada button yang specific
  // null = no deletion in progress
  // string = ID of subject being deleted
  const [deletingId, setDeletingId] = useState<string | null>(null)

  /**
   * HANDLE DELETE SUBJECT
   * =====================
   * Function untuk delete subject dengan confirmation
   * 
   * Flow:
   * 1. Show confirmation dialog
   * 2. User confirms → proceed
   * 3. Set loading state (deletingId)
   * 4. Send DELETE request ke API
   * 5. Success → show toast, reload page
   * 6. Error → show error toast
   * 7. Finally → clear loading state
   * 
   * Cascade Delete:
   * - Subject deleted → all students deleted → all grades deleted
   * - Handled by Prisma cascade in schema
   * 
   * @param subjectId - UUID of subject to delete
   */
  const handleDelete = async (subjectId: string) => {
    // === STEP 1: CONFIRMATION ===
    // Show native browser confirmation dialog
    // Returns: true if user clicks OK, false if Cancel
    // Note: window.confirm is synchronous and blocking
    const userConfirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus mata pelajaran ini?\n\nSemua data siswa dan nilai akan ikut terhapus dan tidak dapat dikembalikan.'
    )
    
    if (!userConfirmed) {
      return
    }

    setDeletingId(subjectId)
    
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Mata pelajaran berhasil dihapus')
        window.location.reload()
      } else {
        toast.error(data.error || 'Gagal menghapus mata pelajaran')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Terjadi kesalahan saat menghapus mata pelajaran')
    } finally {
      setDeletingId(null)
    }
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Belum ada mata pelajaran
          </h3>
          <p className="mt-2 text-gray-500">
            Mulai dengan menambahkan mata pelajaran pertama Anda.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/subjects/new">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Tambah Mata Pelajaran
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <Card key={subject.id} className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold text-gray-800 mb-2 break-words">
                  {subject.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {subject.semester && (
                    <Badge 
                      variant="secondary" 
                      className={`font-medium ${
                        subject.semester === 'Ganjil'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {subject.semester === 'Ganjil' ? '📅 Ganjil' : '📅 Genap'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/dashboard/subjects/${subject.id}/edit`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    title="Edit mata pelajaran"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subject.id)}
                  disabled={deletingId === subject.id}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  title="Hapus mata pelajaran"
                >
                  {deletingId === subject.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Statistik Siswa */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Siswa</p>
                    <p className="text-xl font-bold text-gray-800">{subject._count.students}</p>
                  </div>
                </div>
              </div>
              
              {/* Tombol Kelola */}
              <Link 
                href={`/dashboard/subjects/${subject.id}`}
                className="block w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 h-11">
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Siswa & Nilai
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}