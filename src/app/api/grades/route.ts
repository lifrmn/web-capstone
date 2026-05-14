/**
 * API ROUTE: GRADES
 * =================
 * Endpoint untuk manajemen nilai siswa
 * 
 * Methods:
 * - POST: Simpan/update nilai siswa
 * 
 * Struktur Nilai:
 * - LM (Lingkup Materi) 1-5: Masing-masing punya TP1-TP4 dan SUM
 * - semester_final: Nilai Sumatif Akhir Semester
 * 
 * Authentication: Required (JWT)
 * Authorization: Guru hanya bisa manage nilai siswa di subject miliknya
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/grades
 * ================
 * Handler untuk menyimpan atau mengupdate nilai siswa
 * 
 * Body: { studentId, lm1_tp1, lm1_tp2, ..., semester_final }
 * Returns: Grade object yang ter-update
 * 
 * Flow:
 * 1. Validasi autentikasi
 * 2. Verifikasi otorisasi (siswa milik subject guru ini)
 * 3. Parse semua field nilai (nullable)
 * 4. Upsert: Update jika ada, Create jika belum ada
 */
export async function POST(request: Request) {
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
    const { studentId } = data

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID wajib diisi' },
        { status: 400 }
      )
    }

    // === OTORISASI ===
    // Verifikasi bahwa siswa ini ada di subject milik guru yang login
    // Mencegah guru mengubah nilai siswa guru lain
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

    // === PREPARE GRADE DATA ===
    // Siapkan object untuk create/update grade
    // Semua field optional (bisa null)
    const gradeData: any = { studentId }
    
    // === LINGKUP MATERI 1 ===
    // Parse nilai TP1-TP4 dan SUM untuk LM1
    if (data.lm1_tp1 !== undefined) gradeData.lm1_tp1 = data.lm1_tp1 ? parseFloat(data.lm1_tp1) : null
    if (data.lm1_tp2 !== undefined) gradeData.lm1_tp2 = data.lm1_tp2 ? parseFloat(data.lm1_tp2) : null
    if (data.lm1_tp3 !== undefined) gradeData.lm1_tp3 = data.lm1_tp3 ? parseFloat(data.lm1_tp3) : null
    if (data.lm1_tp4 !== undefined) gradeData.lm1_tp4 = data.lm1_tp4 ? parseFloat(data.lm1_tp4) : null
    if (data.lm1_sum !== undefined) gradeData.lm1_sum = data.lm1_sum ? parseFloat(data.lm1_sum) : null
    
    // Lingkup Materi 2
    if (data.lm2_tp1 !== undefined) gradeData.lm2_tp1 = data.lm2_tp1 ? parseFloat(data.lm2_tp1) : null
    if (data.lm2_tp2 !== undefined) gradeData.lm2_tp2 = data.lm2_tp2 ? parseFloat(data.lm2_tp2) : null
    if (data.lm2_tp3 !== undefined) gradeData.lm2_tp3 = data.lm2_tp3 ? parseFloat(data.lm2_tp3) : null
    if (data.lm2_tp4 !== undefined) gradeData.lm2_tp4 = data.lm2_tp4 ? parseFloat(data.lm2_tp4) : null
    if (data.lm2_sum !== undefined) gradeData.lm2_sum = data.lm2_sum ? parseFloat(data.lm2_sum) : null
    
    // Lingkup Materi 3
    if (data.lm3_tp1 !== undefined) gradeData.lm3_tp1 = data.lm3_tp1 ? parseFloat(data.lm3_tp1) : null
    if (data.lm3_tp2 !== undefined) gradeData.lm3_tp2 = data.lm3_tp2 ? parseFloat(data.lm3_tp2) : null
    if (data.lm3_tp3 !== undefined) gradeData.lm3_tp3 = data.lm3_tp3 ? parseFloat(data.lm3_tp3) : null
    if (data.lm3_tp4 !== undefined) gradeData.lm3_tp4 = data.lm3_tp4 ? parseFloat(data.lm3_tp4) : null
    if (data.lm3_sum !== undefined) gradeData.lm3_sum = data.lm3_sum ? parseFloat(data.lm3_sum) : null
    
    // Lingkup Materi 4
    if (data.lm4_tp1 !== undefined) gradeData.lm4_tp1 = data.lm4_tp1 ? parseFloat(data.lm4_tp1) : null
    if (data.lm4_tp2 !== undefined) gradeData.lm4_tp2 = data.lm4_tp2 ? parseFloat(data.lm4_tp2) : null
    if (data.lm4_tp3 !== undefined) gradeData.lm4_tp3 = data.lm4_tp3 ? parseFloat(data.lm4_tp3) : null
    if (data.lm4_tp4 !== undefined) gradeData.lm4_tp4 = data.lm4_tp4 ? parseFloat(data.lm4_tp4) : null
    if (data.lm4_sum !== undefined) gradeData.lm4_sum = data.lm4_sum ? parseFloat(data.lm4_sum) : null
    
    // Lingkup Materi 5
    if (data.lm5_tp1 !== undefined) gradeData.lm5_tp1 = data.lm5_tp1 ? parseFloat(data.lm5_tp1) : null
    if (data.lm5_tp2 !== undefined) gradeData.lm5_tp2 = data.lm5_tp2 ? parseFloat(data.lm5_tp2) : null
    if (data.lm5_tp3 !== undefined) gradeData.lm5_tp3 = data.lm5_tp3 ? parseFloat(data.lm5_tp3) : null
    if (data.lm5_tp4 !== undefined) gradeData.lm5_tp4 = data.lm5_tp4 ? parseFloat(data.lm5_tp4) : null
    if (data.lm5_sum !== undefined) gradeData.lm5_sum = data.lm5_sum ? parseFloat(data.lm5_sum) : null
    
    // Semester Final
    if (data.semester_final !== undefined) gradeData.semester_final = data.semester_final ? parseFloat(data.semester_final) : null

    // === UPSERT LOGIC ===
    // Cek apakah grade record sudah ada untuk siswa ini
    const existingGrade = await prisma.grade.findFirst({
      where: { studentId }
    })

    let grade
    if (existingGrade) {
      // === UPDATE EXISTING GRADE ===
      // Jika grade sudah ada, update dengan data baru
      // Hapus studentId dari gradeData karena tidak perlu di-update
      const { studentId: _, ...updateData } = gradeData
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: updateData
      })
    } else {
      // === CREATE NEW GRADE ===
      // Jika belum ada grade, buat record baru
      grade = await prisma.grade.create({
        data: gradeData
      })
    }

    return NextResponse.json(grade)
  } catch (error) {
    console.error('Grade save error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}