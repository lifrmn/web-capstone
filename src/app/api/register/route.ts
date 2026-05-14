/**
 * API ROUTE: REGISTER
 * ===================
 * Endpoint untuk registrasi akun guru baru
 * 
 * Method: POST
 * Body: { name, email, password, fase }
 * Response: { message, user } atau { error }
 * 
 * Fitur:
 * - Validasi input
 * - Cek duplikasi email
 * - Password hashing dengan bcrypt
 * - Pembuatan user baru di database
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/register
 * ==================
 * Handler untuk registrasi guru baru
 */
export async function POST(request: Request) {
  try {
    // Parse request body untuk mendapatkan data registrasi
    const { name, email, password, fase } = await request.json()

    // === VALIDASI INPUT ===
    // Pastikan field wajib diisi (name, email, password)
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Kelas dan fase opsional untuk sementara
    // if (!kelas || !fase) {
    //   return NextResponse.json(
    //     { error: 'Kelas dan fase pembelajaran wajib dipilih' },
    //     { status: 400 }
    //   )
    // }

    // === CEK DUPLIKASI EMAIL ===
    // Query database untuk cek apakah email sudah terdaftar
    // Email harus unique (satu guru satu akun)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // === HASH PASSWORD ===
    // Menggunakan bcrypt untuk hash password sebelum disimpan ke database
    // Rounds: 12 (balance antara security dan performance)
    // Password asli TIDAK PERNAH disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 12)

    // === BUAT USER BARU ===
    // Simpan data user baru ke database
    // kelas dan fase di-comment sementara (optional)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // kelas, // Sementara dinonaktifkan sampai Prisma generate ulang
        // fase   // Sementara dinonaktifkan sampai Prisma generate ulang
      },
      select: {
        id: true,
        name: true,
        email: true,
        // kelas: true, // Sementara dinonaktifkan
        // fase: true   // Sementara dinonaktifkan
      }
    })

    return NextResponse.json(
      { message: 'Akun berhasil dibuat', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}