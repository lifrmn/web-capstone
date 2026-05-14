/**
 * DASHBOARD LAYOUT
 * ================
 * Layout wrapper untuk semua halaman dashboard
 * 
 * Server Component: Yes (authentication check di server)
 * 
 * Features:
 * - Authentication check dengan redirect
 * - Wraps children dengan DashboardLayout component
 * - Session verification
 * 
 * Flow:
 * 1. Get server session
 * 2. If no session → redirect ke /login
 * 3. If session exists → render DashboardLayout dengan children
 * 
 * DashboardLayout includes:
 * - Sidebar navigation
 * - Header dengan user info
 * - Logout functionality
 * - Responsive mobile menu
 * 
 * Used for:
 * - /dashboard (stats page)
 * - /dashboard/subjects (mata pelajaran list)
 * - /dashboard/subjects/[id] (subject detail)
 * - /dashboard/siswa (students list)
 * - /dashboard/profile (user profile)
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

/**
 * DASHBOARD LAYOUT ROOT
 * =====================
 * Root layout untuk dashboard section
 */
export default async function DashboardLayoutRoot({
  children,
}: {
  children: React.ReactNode
}) {
  // === AUTHENTICATION CHECK ===
  // Get session di server-side untuk security
  const session = await getServerSession(authOptions)

  // Redirect ke login jika tidak ada session
  if (!session) {
    redirect('/login')
  }

  // Render dashboard layout dengan children (page content)
  return <DashboardLayout>{children}</DashboardLayout>
}