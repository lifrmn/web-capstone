/**
 * API ROUTE: SUBJECTS
 * ===================
 * Endpoint untuk manajemen mata pelajaran (CRUD operations)
 * 
 * Methods:
 * - POST: Buat mata pelajaran baru
 * - GET: Ambil semua mata pelajaran guru yang login
 * 
 * Authentication: Required (JWT)
 * Authorization: Guru hanya bisa manage mata pelajaran miliknya sendiri
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering untuk memastikan data selalu fresh
export const dynamic = 'force-dynamic'

/**
 * POST /api/subjects
 * ==================
 * Handler untuk membuat mata pelajaran baru
 * 
 * Body: { name: string, semester?: string }
 * Returns: Subject object atau error
 */
export async function POST(request: Request) {
  try {
    // === AUTENTIKASI ===
    // Cek apakah user sudah login dengan mengambil session
    const session = await getServerSession(authOptions)
    
    // Jika tidak ada session atau user ID, return 401 Unauthorized
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { name, semester } = await request.json()

    // === VALIDASI INPUT ===
    // Nama mata pelajaran wajib diisi
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama mata pelajaran wajib diisi' },
        { status: 400 }
      )
    }

    // === CEK DUPLIKASI ===
    // Pastikan guru ini belum punya mata pelajaran dengan nama yang sama
    // Satu guru tidak boleh punya 2 subject dengan nama sama
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: name.trim(),
        teacherId: session.user.id
      }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Mata pelajaran sudah ada' },
        { status: 400 }
      )
    }

    // === BUAT SUBJECT BARU ===
    // Simpan mata pelajaran baru ke database
    // Otomatis link dengan guru yang login (teacherId)
    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        semester: semester?.trim() || null,
        teacherId: session.user.id,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error('Subject creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subjects
 * =================
 * Handler untuk mengambil semua mata pelajaran guru yang login
 * 
 * Returns: Array of subjects dengan student count
 */
export async function GET(request: Request) {
  try {
    // === AUTENTIKASI ===
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // === QUERY SUBJECTS ===
    // Ambil semua mata pelajaran milik guru ini
    // Include: jumlah siswa per subject (_count)
    // Order: berdasarkan nama (A-Z)
    const subjects = await prisma.subject.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Subjects fetch error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}