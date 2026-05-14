/**
 * DASHBOARD PAGE
 * ==============
 * Halaman utama dashboard dengan statistik lengkap dan analytics
 * 
 * Server Component: Yes (fetch data di server-side)
 * Revalidation: 60 detik (ISR - Incremental Static Regeneration)
 * 
 * Features:
 * - Statistik mata pelajaran, siswa, dan nilai
 * - Rata-rata nilai per subject
 * - Distribusi nilai (A, B, C, D, E)
 * - Top 5 siswa berprestasi
 * - Siswa yang perlu perhatian (nilai rendah)
 * - Deduplication siswa berdasarkan nama
 * - Error handling untuk database connection
 * 
 * Data Flow:
 * 1. Check authentication dengan getServerSession
 * 2. Query subjects dengan students dan grades (optimized)
 * 3. Calculate statistics (counts, averages, distributions)
 * 4. Pass data ke DashboardStats client component untuk display
 * 
 * Performance Optimizations:
 * - Select only needed fields
 * - Limit grades to latest only
 * - Error boundary untuk database failures
 * - ISR untuk caching dengan auto-revalidation
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/dashboard/dashboard-stats'

// Force dynamic rendering untuk data yang selalu fresh
export const dynamic = 'force-dynamic'
// Revalidate every 60 seconds untuk ISR (balance antara freshness dan performance)
export const revalidate = 60

/**
 * DASHBOARD PAGE COMPONENT
 * ========================
 * Main component untuk dashboard page
 */
export default async function DashboardPage() {
  // === AUTHENTICATION CHECK ===
  // Get server session untuk verify user logged in
  const session = await getServerSession(authOptions)
  
  // Jika tidak ada session, return null (akan redirect di middleware)
  if (!session?.user?.id) {
    return null
  }

  // === DATA FETCHING WITH ERROR HANDLING ===
  // Query subjects dengan nested relations (students + grades)
  // Menggunakan try-catch untuk handle database connection errors
  let subjects
  try {
    subjects = await prisma.subject.findMany({
    // Filter: Hanya subjects milik guru yang login
    where: { teacherId: session.user.id },
    // Select: Hanya ambil fields yang diperlukan (query optimization)
    select: {
      id: true,
      name: true,
      semester: true,
      // Nested select untuk students dan grades
      students: {
        select: {
          id: true,
          name: true,
          // Ambil grades untuk calculate averages
          grades: {
            select: {
              final_score: true,     // Nilai Rapor
              lm1_sum: true,         // Lingkup Materi 1-6
              lm2_sum: true,
              lm3_sum: true,
              lm4_sum: true,
              lm5_sum: true,
              lm6_sum: true,
              semester_final: true,  // Sumatif Akhir Semester
            },
            take: 1,  // Hanya ambil grade terbaru (optimization)
            orderBy: { updatedAt: 'desc' }
          }
        }
      },
      // Count students untuk statistik
      _count: {
        select: { students: true }
      }
    },
    // Order by name untuk display yang terurut
    orderBy: { name: 'asc' }
  })
  } catch (error) {
    // Error handling: Log error dan return empty data
    console.error('Database connection error:', error)
    // Fallback ke empty array agar app tidak crash
    subjects = []
  }

  // === STATISTICS CALCULATION ===
  
  // 1. BASIC COUNTS
  const subjectCount = subjects.length
  // Total student entries (termasuk duplikasi di berbagai subjects)
  const studentCount = subjects.reduce((sum, s) => sum + s._count.students, 0)
  
  // 2. UNIQUE STUDENT COUNT
  // Deduplicate students berdasarkan nama (siswa sama bisa ada di beberapa subjects)
  const allStudents = subjects.flatMap(s => s.students)
  const uniqueStudentNames = new Set(allStudents.map(s => s.name))
  const uniqueStudentCount = uniqueStudentNames.size

  // 3. SUBJECT AVERAGES
  // Calculate rata-rata nilai per subject untuk comparison
  const subjectAverages = subjects.map(subject => {
    const students = subject.students
    // Jika tidak ada siswa, return 0
    if (students.length === 0) return { name: subject.name, average: 0 }
    
    // Filter hanya scores yang valid (not null/undefined)
    const validScores = students
      .map(s => s.grades[0]?.final_score)
      .filter((score): score is number => score !== null && score !== undefined)
    
    // Calculate average dengan error handling
    const average = validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0
    
    // Round ke 1 decimal untuk readability
    return { name: subject.name, average: Math.round(average * 10) / 10 }
  })

  // 4. GRADE DISTRIBUTION
  // Distribusi nilai berdasarkan rentang (A, B, C, D, E)
  const allGrades = allStudents
    .map(s => s.grades[0]?.final_score)
    .filter((score): score is number => score !== null && score !== undefined)
  
  // Grade ranges:
  // A: 90-100, B: 75-89, C: 60-74, D: 50-59, E: <50
  const gradeDistribution = {
    A: allGrades.filter(s => s >= 90).length,        // Excellent
    B: allGrades.filter(s => s >= 75 && s < 90).length,  // Good
    C: allGrades.filter(s => s >= 60 && s < 75).length,  // Average
    D: allGrades.filter(s => s >= 50 && s < 60).length,  // Below Average
    E: allGrades.filter(s => s < 50).length,        // Failing
  }

  // 5. TOP STUDENTS
  // Siswa dengan nilai tertinggi (top 5) untuk recognition
  const topStudents = allStudents
    .map(s => ({
      name: s.name,
      score: s.grades[0]?.final_score || 0,
      // Find subject name untuk context
      subjectName: subjects.find(sub => sub.students.some(st => st.id === s.id))?.name || ''
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Siswa yang perlu perhatian (bottom 5 dengan nilai < 75)
  const needsAttention = allStudents
    .map(s => ({
      name: s.name,
      score: s.grades[0]?.final_score || 0,
      subjectName: subjects.find(sub => sub.students.some(st => st.id === s.id))?.name || ''
    }))
    .filter(s => s.score > 0 && s.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)

  // Hitung siswa yang belum dinilai
  const ungradedCount = allStudents.filter(s => {
    const grade = s.grades[0]
    return !grade?.final_score && !grade?.lm1_sum && !grade?.lm2_sum
  }).length

  // Rata-rata keseluruhan
  const overallAverage = allGrades.length > 0
    ? Math.round((allGrades.reduce((sum, s) => sum + s, 0) / allGrades.length) * 10) / 10
    : 0

  // Persentase kelulusan (nilai >= 75)
  const passedCount = allGrades.filter(s => s >= 75).length
  const passPercentage = allGrades.length > 0
    ? Math.round((passedCount / allGrades.length) * 100)
    : 0

  return (
    <DashboardStats 
      subjectCount={subjectCount}
      studentCount={uniqueStudentCount}
      overallAverage={overallAverage}
      passPercentage={passPercentage}
      subjectAverages={subjectAverages}
      gradeDistribution={gradeDistribution}
      topStudents={topStudents}
      needsAttention={needsAttention}
      ungradedCount={ungradedCount}
      teacherName={session.user.name || 'Guru'}
    />
  )
}