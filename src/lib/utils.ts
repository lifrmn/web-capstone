/**
 * UTILITY FUNCTIONS
 * =================
 * File ini berisi helper functions yang digunakan di seluruh aplikasi
 * 
 * Current utilities:
 * - cn(): Merge Tailwind CSS classes dengan conflict resolution
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * CN (CLASS NAMES) FUNCTION
 * =========================
 * Utility function untuk menggabungkan class names dengan smart merging
 * 
 * Features:
 * - Conditional classes support (clsx)
 * - Tailwind conflict resolution (twMerge)
 * - Type-safe dengan ClassValue
 * 
 * Example Usage:
 * ```tsx
 * // Basic merging
 * cn('px-4 py-2', 'bg-blue-500')
 * // Output: 'px-4 py-2 bg-blue-500'
 * 
 * // Conditional classes
 * cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class')
 * 
 * // Conflict resolution
 * cn('px-4', 'px-8')  // Output: 'px-8' (last one wins)
 * cn('text-red-500', 'text-blue-500')  // Output: 'text-blue-500'
 * ```
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged class string dengan conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  // Step 1: clsx() - Handle conditional logic dan flatten arrays
  // Step 2: twMerge() - Merge classes dan resolve Tailwind conflicts
  return twMerge(clsx(inputs))
}
