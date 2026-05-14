/**
 * AUTH PROVIDER COMPONENT
 * =======================
 * Wrapper component untuk NextAuth SessionProvider
 * 
 * Purpose:
 * - Provide session context ke seluruh application
 * - Enable useSession hook di semua client components
 * - Handle session state management globally
 * 
 * Client Component: Yes (SessionProvider requires client)
 * 
 * Usage:
 * Wrap this provider di root layout atau _app untuk enable authentication
 * context throughout the application.
 * 
 * Example:
 * ```tsx
 * <AuthProvider>
 *   <YourApp />
 * </AuthProvider>
 * ```
 * 
 * What SessionProvider Does:
 * 1. Manages session state (logged in/out)
 * 2. Provides session data to all components via useSession hook
 * 3. Handles session refresh automatically
 * 4. Broadcasts session changes across tabs (optional)
 * 5. Provides loading states during session check
 * 
 * Props:
 * - children: ReactNode - App components yang akan wrapped
 * 
 * Benefits:
 * - Centralized session management
 * - Type-safe session access via useSession
 * - Automatic session synchronization
 * - No need to pass session via props drilling
 * 
 * Technical Details:
 * - Uses React Context API internally
 * - Checks session on mount and periodically
 * - Stores session in memory (not localStorage for security)
 * - Can be configured with custom options (refetchInterval, etc)
 */

'use client'  // Required: SessionProvider is a client component

// === IMPORTS ===
import { SessionProvider } from 'next-auth/react'  // NextAuth session provider
import { ReactNode } from 'react'  // React type untuk children

// === INTERFACE ===
// Props untuk AuthProvider component
interface AuthProviderProps {
  children: ReactNode  // Any valid React node (components, elements, text, etc)
}

/**
 * AUTH PROVIDER FUNCTION
 * ======================
 * Simple wrapper component
 * 
 * Implementation:
 * - Takes children prop
 * - Wraps dengan SessionProvider
 * - No additional logic needed
 * 
 * SessionProvider automatically:
 * - Fetches session on mount
 * - Re-validates session periodically
 * - Provides session via useSession hook
 * - Handles loading and error states
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Return SessionProvider wrapping children
  // SessionProvider akan:
  // 1. Check current session via /api/auth/session
  // 2. Store session in React Context
  // 3. Make session available via useSession() hook
  // 4. Re-check session every 5 minutes (default)
  return <SessionProvider>{children}</SessionProvider>
}