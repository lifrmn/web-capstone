/**
 * API ROUTE: EXPORT EXCEL
 * =======================
 * Endpoint untuk export semua data nilai ke Excel dengan formatting
 * 
 * Method: GET
 * Authentication: Required (JWT)
 * Response: Excel file (.xlsx) binary stream
 * 
 * Features:
 * - Multi-sheet workbook (1 ringkasan + 1 per subject)
 * - Professional formatting (colors, borders, alignment)
 * - Summary statistics
 * - Detailed grades per subject
 * - Auto column width
 * - Conditional formatting
 * - Date stamped filename
 * 
 * Excel Structure:
 * Sheet 1: Ringkasan
 *   - Teacher info
 *   - Overall statistics
 *   - Subject list dengan averages
 * 
 * Sheet 2-N: Per Subject
 *   - Subject header
 *   - Student list dengan semua grades (LM1-6, SAS, NR)
 *   - Alternating row colors
 * 
 * Library: ExcelJS (powerful Excel generation)
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

// Force dynamic untuk data yang selalu fresh
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/export-excel
 * ================================
 * Handler untuk generate dan download Excel file
 */
export async function GET() {
  try {
    // === AUTHENTICATION ===
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // === DATA FETCHING ===
    // Query semua subjects dengan nested students dan grades
    // Include untuk get full relations
    const subjects = await prisma.subject.findMany({
      where: { teacherId: session.user.id },
      include: {
        // Include students dengan grades
        students: {
          include: {
            grades: {
              take: 1,  // Hanya grade terbaru
              orderBy: { updatedAt: 'desc' }
            }
          },
          orderBy: { name: 'asc' }  // Sort alphabetically
        }
      },
      orderBy: { name: 'asc' }
    })

    // === VALIDATION ===
    if (subjects.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data untuk diekspor' },
        { status: 404 }
      )
    }

    // === CREATE WORKBOOK ===
    // Initialize ExcelJS workbook dengan metadata
    const workbook = new ExcelJS.Workbook()
    workbook.creator = session.user.name || 'Guru'
    workbook.created = new Date()
    workbook.modified = new Date()

    // === SHEET 1: RINGKASAN ===
    // Create summary sheet dengan overall statistics
    const summarySheet = workbook.addWorksheet('Ringkasan')
    
    // TITLE ROW dengan merge cells
    summarySheet.mergeCells('A1:D1')
    const titleCell = summarySheet.getCell('A1')
    titleCell.value = 'LAPORAN LENGKAP PENILAIAN'
    // Styling: white text on blue background
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }  // Blue background
    }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    summarySheet.getRow(1).height = 30  // Larger height untuk title

    // Info guru
    summarySheet.getCell('A3').value = 'Guru:'
    summarySheet.getCell('B3').value = session.user.name || '-'
    summarySheet.getCell('A4').value = 'Tanggal Export:'
    summarySheet.getCell('B4').value = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Statistik
    const totalStudents = subjects.reduce((sum, s) => sum + s.students.length, 0)
    const uniqueStudents = new Set(subjects.flatMap(s => s.students.map(st => st.name))).size
    
    summarySheet.getCell('A6').value = 'STATISTIK'
    summarySheet.getCell('A6').font = { bold: true, size: 12 }
    
    const stats = [
      ['Total Mata Pelajaran', subjects.length],
      ['Total Siswa (Unik)', uniqueStudents],
      ['Total Entri Siswa', totalStudents],
    ]
    
    let row = 7
    stats.forEach(([label, value]) => {
      summarySheet.getCell(`A${row}`).value = label
      summarySheet.getCell(`B${row}`).value = value
      summarySheet.getCell(`B${row}`).font = { bold: true }
      row++
    })

    // Daftar mata pelajaran
    summarySheet.getCell('A11').value = 'DAFTAR MATA PELAJARAN'
    summarySheet.getCell('A11').font = { bold: true, size: 12 }
    
    const headerRow = summarySheet.getRow(12)
    headerRow.values = ['No', 'Mata Pelajaran', 'Semester', 'Jumlah Siswa', 'Rata-rata Nilai']
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    }

    subjects.forEach((subject, index) => {
      const validScores = subject.students
        .map(s => s.grades[0]?.final_score)
        .filter((score): score is number => score !== null && score !== undefined)
      
      const avgScore = validScores.length > 0
        ? (validScores.reduce((sum, s) => sum + s, 0) / validScores.length).toFixed(1)
        : '-'

      const dataRow = summarySheet.getRow(13 + index)
      dataRow.values = [
        index + 1,
        subject.name,
        subject.semester || '-',
        subject.students.length,
        avgScore
      ]
    })

    // Auto width
    summarySheet.columns = [
      { width: 5 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ]

    // Sheet untuk setiap mata pelajaran
    subjects.forEach((subject) => {
      const sheet = workbook.addWorksheet(subject.name.substring(0, 30))
      
      // Header
      sheet.mergeCells('A1:M1')
      const titleCell = sheet.getCell('A1')
      titleCell.value = subject.name
      titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }
      }
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
      sheet.getRow(1).height = 25

      // Info subject
      sheet.getCell('A2').value = `Semester: ${subject.semester || '-'}`
      sheet.getCell('A3').value = `Jumlah Siswa: ${subject.students.length}`

      // === HEADER TABEL ===
      // Header kolom untuk data siswa dan nilai
      const headerRow = sheet.getRow(5)
      // Set values untuk semua kolom
      headerRow.values = ['No', 'Nama Siswa', 'L/P', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'SAS', 'NR', 'Keterangan']
      // Styling: white text on dark blue background
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }  // Dark blue
      }
      // Center alignment untuk header
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
      headerRow.height = 20  // Larger height

      // === DATA SISWA ===
      // Loop through semua siswa dalam subject
      subject.students.forEach((student, index) => {
        // Get grade record terbaru (sudah di-sort by updatedAt desc)
        const grade = student.grades[0]
        // Row dimulai dari 6 (setelah header di row 5)
        const dataRow = sheet.getRow(6 + index)
        // Set semua cell values untuk row ini
        dataRow.values = [
          index + 1,                      // No urut
          student.name,                   // Nama lengkap
          student.gender || '-',          // L/P atau dash jika kosong
          grade?.lm1_sum || '-',          // Lingkup Materi 1 SUM
          grade?.lm2_sum || '-',          // Lingkup Materi 2 SUM
          grade?.lm3_sum || '-',          // Lingkup Materi 3 SUM
          grade?.lm4_sum || '-',          // Lingkup Materi 4 SUM
          grade?.lm5_sum || '-',          // Lingkup Materi 5 SUM
          grade?.lm6_sum || '-',          // Lingkup Materi 6 SUM
          grade?.semester_final || '-',   // Sumatif Akhir Semester (SAS)
          grade?.final_score ? grade.final_score.toFixed(2) : '-',  // Nilai Rapor (2 decimal)
          student.notes || '-'            // Keterangan
        ]
        
        // === ALTERNATING ROW COLORS ===
        // Zebra striping untuk readability - every even row
        if (index % 2 === 0) {
          // Light gray background untuk even rows
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }  // Very light gray
          }
        }
      })

    // === BORDERS AND ALIGNMENT ===
    // Tambahkan border ke semua cells dalam table
    const lastRow = 5 + subject.students.length  // Calculate last row number
    // Loop through rows (dari header sampai last data)
    for (let i = 5; i <= lastRow; i++) {
      // Loop through columns (12 kolom total)
      for (let j = 1; j <= 12; j++) {
        // Get cell reference
        const cell = sheet.getCell(i, j)
        // Add thin borders on all sides
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        // Alignment: center untuk data rows (tidak untuk header)
        if (i > 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        }
      }
    }

    // === AUTO COLUMN WIDTH ===
    // Set width untuk setiap kolom agar data tidak terpotong
    sheet.columns = [
      { width: 5 },   // No (narrow)
      { width: 25 },  // Nama (wide untuk nama panjang)
      { width: 8 },   // L/P (narrow)
      { width: 10 },  // LM1
      { width: 10 },  // LM2
      { width: 10 },  // LM3
      { width: 10 },  // LM4
      { width: 10 },  // LM5
      { width: 10 },  // LM6
      { width: 10 },  // SAS
      { width: 10 },  // NR
      { width: 20 }   // Keterangan (wide)
    ]
  })  // End loop subjects

  // === GENERATE EXCEL FILE ===
  // Convert workbook ke binary buffer untuk response
  const buffer = await workbook.xlsx.writeBuffer()

  // === RETURN RESPONSE ===
  // Send Excel file sebagai download response
  return new NextResponse(buffer, {
    headers: {
      // Content-Type untuk Excel file (.xlsx format)
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Content-Disposition: attachment memicu download dengan filename dynamic (tanggal hari ini)
      'Content-Disposition': `attachment; filename="Laporan_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx"`
    }
  })

  } catch (error) {
    // === ERROR HANDLING ===
    // Log error untuk debugging
    console.error('Export error:', error)
    // Return error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}  // End GET function
