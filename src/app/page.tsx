/**
 * HOME PAGE (ROOT)
 * ================
 * Landing page aplikasi yang berfungsi sebagai router
 * 
 * Behavior:
 * - Jika user sudah login: redirect ke /dashboard
 * - Jika user belum login: redirect ke /login
 * 
 * Server Component: Yes (menggunakan getServerSession)
 * Authentication Check: Required
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * HOME COMPONENT
 * ==============
 * Server component yang melakukan conditional redirect berdasarkan auth state
 */
export default async function Home() {
  // Check session di server-side
  const session = await getServerSession(authOptions)

  // Conditional redirect
  if (session) {
    // User sudah login: arahkan ke dashboard
    redirect('/dashboard')
  } else {
    // User belum login: arahkan ke login page
    redirect('/login')
  }
}