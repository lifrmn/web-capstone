/**
 * INPUT COMPONENT (UI)
 * ====================
 * Reusable input field component dengan styling konsisten
 * 
 * Built with:
 * - React ForwardRef untuk ref support
 * - Tailwind CSS untuk styling
 * - Shadcn/ui design system
 * 
 * Features:
 * - Type support (text, email, password, number, dll)
 * - Focus ring untuk accessibility
 * - Disabled state dengan opacity
 * - File input styling
 * - Placeholder styling
 * - Full width by default
 * - Responsive design
 * 
 * States:
 * - Default: Bordered dengan gray
 * - Focus: Blue ring dengan offset
 * - Disabled: Grayed out dengan not-allowed cursor
 * - Invalid: Dapat di-style dengan className
 * 
 * Usage:
 * ```tsx
 * <Input type="text" placeholder="Enter name" />
 * <Input type="email" value={email} onChange={handleChange} />
 * <Input type="password" required />
 * <Input type="number" min={0} max={100} />
 * ```
 */

import * as React from "react"

import { cn } from "@/lib/utils"

// === INPUT PROPS ===
// Extends native input props untuk type safety
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * INPUT COMPONENT
 * ===============
 * ForwardRef component untuk support ref forwarding
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}  // text, email, password, number, dll
        className={cn(
          // Base styles: Layout dan sizing
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          // Focus styles: Ring effect untuk accessibility
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholder styles
          "placeholder:text-muted-foreground",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          className  // Allow custom className override
        )}
        ref={ref}  // Forward ref untuk parent component
        {...props} // Spread semua props lainnya (value, onChange, dll)
      />
    )
  }
)
// Display name untuk React DevTools
Input.displayName = "Input"

export { Input }