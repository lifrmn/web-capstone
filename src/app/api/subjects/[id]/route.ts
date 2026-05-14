/**
 * API ROUTE: SUBJECTS/[ID]
 * ========================
 * Endpoint untuk operasi individual subject berdasarkan ID
 * 
 * Methods:
 * - DELETE: Hapus mata pelajaran beserta semua siswa dan nilai
 * - PUT: Update nama dan semester mata pelajaran
 * 
 * Authentication: Required (JWT)
 * Authorization: Guru hanya bisa manage subject miliknya sendiri
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/subjects/[id]
 * =========================
 * Handler untuk menghapus mata pelajaran beserta cascade delete
 * 
 * Cascade Flow:
 * 1. Hapus semua grades dari siswa di subject ini
 * 2. Hapus semua students di subject ini
 * 3. Hapus subject itu sendiri
 * 
 * Params: { id: string } - Subject ID
 * Returns: Success message atau error
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // === AUTENTIKASI ===
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subjectId = params.id

    // === OTORISASI ===
    // Cek apakah mata pelajaran ini milik guru yang login
    // Mencegah guru menghapus subject guru lain
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId: session.user.id
      }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Mata pelajaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // === CASCADE DELETE ===
    // Hapus semua data terkait secara berurutan untuk menghindari foreign key constraint errors
    
    // Step 1: Hapus grades dari semua siswa di mata pelajaran ini
    await prisma.grade.deleteMany({
      where: {
        student: {
          subjectId: subjectId
        }
      }
    })

    // Step 2: Hapus siswa dari mata pelajaran ini
    await prisma.student.deleteMany({
      where: {
        subjectId: subjectId
      }
    })

    // Step 3: Hapus mata pelajaran itu sendiri
    await prisma.subject.delete({
      where: {
        id: subjectId
      }
    })

    return NextResponse.json({ 
      message: 'Mata pelajaran berhasil dihapus' 
    }, { status: 200 })

  } catch (error) {
    console.error('Subject deletion error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus mata pelajaran' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/subjects/[id]
 * ======================
 * Handler untuk mengupdate nama dan semester mata pelajaran
 * 
 * Params: { id: string } - Subject ID
 * Body: { name: string, semester?: string }
 * Returns: Updated subject object
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // === AUTENTIKASI ===
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subjectId = params.id
    const { name, semester } = await request.json()

    // === VALIDASI ===
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama mata pelajaran wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah mata pelajaran milik guru ini
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId: session.user.id
      }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Mata pelajaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // === CEK DUPLIKASI NAMA ===
    // Cek apakah nama baru sudah ada (kecuali untuk mata pelajaran ini sendiri)
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: name.trim(),
        teacherId: session.user.id,
        id: {
          not: subjectId
        }
      }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Nama mata pelajaran sudah ada' },
        { status: 400 }
      )
    }

    // === UPDATE SUBJECT ===
    // Update nama dan semester mata pelajaran
    const updatedSubject = await prisma.subject.update({
      where: {
        id: subjectId
      },
      data: {
        name: name.trim(),
        semester: semester || null,
      },
    })

    return NextResponse.json(updatedSubject, { status: 200 })

  } catch (error) {
    console.error('Subject update error:', error)
    return NextResponse.json(
      { error: 'Gagal mengubah mata pelajaran' },
      { status: 500 }
    )
  }
}