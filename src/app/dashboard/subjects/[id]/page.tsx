/**
 * SUBJECT DETAIL PAGE
 * ===================
 * Halaman detail mata pelajaran dengan daftar siswa dan input nilai
 * 
 * Server Component: Yes (data fetching di server)
 * Dynamic Route: /dashboard/subjects/[id]
 * 
 * Features:
 * - Display subject info (name, semester, teacher)
 * - List siswa dalam subject
 * - Grades table dengan inline editing
 * - Auto-create grade records untuk siswa baru
 * - Optimized queries dengan select
 * 
 * Flow:
 * 1. Check authentication
 * 2. Query subject dengan authorization (teacherId check)
 * 3. Ensure semua siswa punya grade record
 * 4. Re-fetch data setelah create grades
 * 5. Pass ke SubjectDetailPage client component
 * 
 * Data Structure:
 * Subject {
 *   id, name, semester
 *   students: [{
 *     id, name, nis, gender, notes, className
 *     grades: [Grade]
 *   }]
 *   teacher: { name, email }
 * }
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SubjectDetailPage from '@/components/subjects/subject-detail-page'

// === PROPS INTERFACE ===
interface Props {
  params: {
    id: string  // Subject ID dari dynamic route
  }
}

/**
 * SUBJECT PAGE COMPONENT
 * ======================
 * Server component untuk subject detail page
 */
export default async function SubjectPage({ params }: Props) {
  // === AUTHENTICATION ===
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // === QUERY SUBJECT WITH AUTHORIZATION ===
  // FindFirst dengan where clause untuk security
  // Memastikan hanya guru yang memiliki subject bisa akses
  const subject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    },
    select: {
      id: true,
      name: true,
      semester: true,
      students: {
        select: {
          id: true,
          name: true,
          nis: true,
          gender: true,
          notes: true,
          className: true,
          grades: true
        },
        orderBy: {
          name: 'asc'
        }
      },
      teacher: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  // === NOT FOUND HANDLING ===
  if (!subject) {
    notFound()  // Return 404 page
  }

  // === ENSURE GRADE RECORDS ===
  // Auto-create grade records untuk siswa yang belum punya
  // Ini diperlukan untuk inline editing di grades table
  for (const student of subject.students) {
    if (student.grades.length === 0) {
      // Create empty grade record
      await prisma.grade.create({
        data: {
          studentId: student.id
        }
      })
    }
  }

  // === RE-FETCH DATA ===
  // Query ulang setelah create grade records
  // Memastikan semua students punya grades untuk display
  const updatedSubject = await prisma.subject.findFirst({
    where: {
      id: params.id,
      teacherId: session.user.id
    },
    select: {
      id: true,
      name: true,
      semester: true,
      students: {
        select: {
          id: true,
          name: true,
          nis: true,
          gender: true,
          notes: true,
          className: true,
          grades: true
        },
        orderBy: {
          name: 'asc'
        }
      },
      teacher: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return <SubjectDetailPage subject={updatedSubject!} />
}