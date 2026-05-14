/**
 * AUTH.TS - KONFIGURASI NEXTAUTH.JS
 * ==================================
 * File ini mengatur autentikasi dan otorisasi sistem menggunakan NextAuth.js
 * 
 * Fitur utama:
 * - Login dengan email dan password (Credentials Provider)
 * - Session management dengan JWT
 * - Password hashing dengan bcrypt
 * - Integrasi dengan Prisma ORM
 */

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

/**
 * AUTHOPTIONS
 * ===========
 * Konfigurasi utama NextAuth.js untuk aplikasi ini
 * Mendefinisikan provider, session strategy, dan callbacks
 */
export const authOptions: NextAuthOptions = {
  // ADAPTER: Menghubungkan NextAuth dengan database via Prisma
  // Menyimpan users, accounts, sessions ke PostgreSQL
  adapter: PrismaAdapter(prisma),
  
  // PROVIDERS: Metode autentikasi yang tersedia
  providers: [
    /**
     * CREDENTIALS PROVIDER
     * ====================
     * Menggunakan email dan password untuk login
     * Password di-hash dengan bcrypt untuk keamanan
     */
    CredentialsProvider({
      name: 'credentials',
      
      // Definisi field yang dibutuhkan untuk login
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      
      /**
       * AUTHORIZE FUNCTION
       * ==================
       * Fungsi yang dijalankan saat user mencoba login
       * 
       * @param credentials - Email dan password dari form login
       * @returns User object jika valid, null jika tidak valid
       */
      async authorize(credentials) {
        // Validasi: Pastikan email dan password diisi
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Query database: Cari user berdasarkan email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        // Jika user tidak ditemukan, return null (login gagal)
        if (!user) {
          return null
        }

        // Verifikasi password: Bandingkan password input dengan hash di database
        // bcrypt.compare() akan otomatis hash password input dan membandingkan
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ''
        )

        // Jika password tidak valid, return null (login gagal)
        if (!isPasswordValid) {
          return null
        }

        // Login berhasil: Return user object
        // Object ini akan disimpan dalam session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  
  /**
   * SESSION STRATEGY
   * ================
   * Menggunakan JWT (JSON Web Token) untuk session management
   * 
   * Keuntungan JWT:
   * - Tidak perlu query database setiap request
   * - Scalable untuk aplikasi besar
   * - Session data tersimpan di client (cookie)
   */
  session: {
    strategy: 'jwt'
  },
  
  /**
   * CUSTOM PAGES
   * ============
   * Mendefinisikan halaman custom untuk autentikasi
   * Semua redirect ke /login untuk UX yang konsisten
   */
  pages: {
    signIn: '/login',    // Halaman login
    signOut: '/login',   // Redirect setelah logout
    error: '/login',     // Halaman error autentikasi
  },
  
  /**
   * CALLBACKS
   * =========
   * Fungsi yang dipanggil pada tahap tertentu dalam flow autentikasi
   * Digunakan untuk memodifikasi JWT dan session object
   */
  callbacks: {
    /**
     * JWT CALLBACK
     * ============
     * Dipanggil setiap kali JWT dibuat atau diupdate
     * 
     * @param token - JWT token saat ini
     * @param user - User object (hanya ada saat initial sign in)
     * @returns Modified token
     */
    async jwt({ token, user }) {
      // Saat initial sign in, tambahkan user ID ke token
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    /**
     * SESSION CALLBACK
     * ================
     * Dipanggil setiap kali session object di-access
     * Menambahkan data dari JWT ke session yang bisa diakses di client
     * 
     * @param session - Session object saat ini
     * @param token - JWT token yang berisi data user
     * @returns Modified session
     */
    async session({ session, token }) {
      // Tambahkan user ID dari token ke session
      // Ini membuat user ID bisa diakses via useSession() di client
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}