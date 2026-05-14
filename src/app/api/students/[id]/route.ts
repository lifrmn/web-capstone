/**
 * API ROUTE: STUDENTS/[ID]
 * ========================
 * Endpoint untuk operasi individual student berdasarkan ID
 * 
 * Methods:
 * - PUT: Update semua data siswa (full update)
 * - PATCH: Update sebagian data siswa (partial update)
 * - DELETE: Hapus siswa beserta nilai-nilainya
 * 
 * Authentication: Required (JWT)
 * Authorization: Guru hanya bisa manage siswa di subject miliknya
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/students/[id]
 * ======================
 * Handler untuk mengupdate semua data siswa (full update)
 * Semua field harus diisi
 * 
 * Params: { id: string } - Student ID
 * Body: { name, gender, notes, className }
 * Returns: Updated student object
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

    const { name, gender, notes, className } = await request.json()

    // === VALIDASI ===
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nama siswa wajib diisi' },
        { status: 400 }
      )
    }

    // === OTORISASI ===
    // Verifikasi bahwa siswa ini ada di subject milik guru yang login
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        subject: {
          teacherId: session.user.id
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // === UPDATE STUDENT ===
    // Update semua data siswa dengan data baru
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        gender: gender?.trim() || null,
        notes: notes?.trim() || null,
        className: className?.trim() || null
      }
    })

    return NextResponse.json({
      message: 'Data siswa berhasil diperbarui',
      student: updatedStudent
    })

  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/students/[id]
 * ========================
 * Handler untuk mengupdate sebagian data siswa (partial update)
 * Hanya field yang dikirim yang akan diupdate
 * 
 * Params: { id: string } - Student ID
 * Body: { name?, gender?, notes?, className? }
 * Returns: Updated student object
 */
export async function PATCH(
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

    const data = await request.json()
    const studentId = params.id

    // === OTORISASI ===
    // Cek apakah student ada dan milik guru ini
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        subject: {
          teacherId: session.user.id
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // === PREPARE UPDATE DATA ===
    // Hanya update field yang ada di request body (partial update)
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.gender !== undefined) updateData.gender = data.gender.trim() || null
    if (data.notes !== undefined) updateData.notes = data.notes.trim() || null
    if (data.className !== undefined) updateData.className = data.className.trim() || null

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData
    })

    return NextResponse.json(updatedStudent)

  } catch (error) {
    console.error('Student update error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate data siswa' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/students/[id]
 * =========================
 * Handler untuk menghapus siswa beserta nilai-nilainya
 * 
 * Cascade Flow:
 * 1. Hapus semua grades siswa ini
 * 2. Hapus siswa itu sendiri
 * 
 * Params: { id: string } - Student ID
 * Returns: Success message
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

    const studentId = params.id

    // Cek apakah student ada dan milik guru ini
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        subject: {
          teacherId: session.user.id
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // === CASCADE DELETE ===
    // Hapus grades terkait siswa ini terlebih dahulu
    await prisma.grade.deleteMany({
      where: {
        studentId: studentId
      }
    })

    // Hapus siswa itu sendiri
    await prisma.student.delete({
      where: {
        id: studentId
      }
    })

    return NextResponse.json({
      message: 'Siswa berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus siswa' },
      { status: 500 }
    )
  }
}