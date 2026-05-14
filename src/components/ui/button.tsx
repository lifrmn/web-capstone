/**
 * BUTTON COMPONENT (UI)
 * =====================
 * Reusable button component dengan variants dan sizes
 * 
 * Built with:
 * - Radix UI Slot untuk composition
 * - CVA (Class Variance Authority) untuk variant management
 * - Tailwind CSS untuk styling
 * 
 * Variants:
 * - default: Primary blue button
 * - destructive: Red button untuk delete actions
 * - outline: Bordered button
 * - secondary: Gray button
 * - ghost: Transparent button
 * - link: Text link style
 * 
 * Sizes:
 * - default: h-10 (40px)
 * - sm: h-9 (36px)
 * - lg: h-11 (44px)
 * - icon: h-10 w-10 (square)
 * 
 * Features:
 * - asChild prop untuk render sebagai child element
 * - Accessible (focus ring, disabled state)
 * - Responsive hover/active states
 * - Type-safe dengan TypeScript
 * 
 * Usage:
 * ```tsx
 * <Button>Click me</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button size="sm" variant="outline">Small</Button>
 * <Button asChild>
 *   <Link href="/page">Link Button</Link>
 * </Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// === BUTTON VARIANTS CONFIGURATION ===
// CVA untuk type-safe variant management
const buttonVariants = cva(
  // Base classes: Layout, typography, states
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // === VARIANT STYLES ===
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // === SIZE STYLES ===
      size: {
        default: "h-10 px-4 py-2",     // Standard button
        sm: "h-9 rounded-md px-3",      // Small button
        lg: "h-11 rounded-md px-8",     // Large button
        icon: "h-10 w-10",              // Square icon button
      },
    },
    // Default values
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// === BUTTON PROPS INTERFACE ===
// Extends native button props + variant props + custom props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean  // Render as child element (Slot pattern)
}

/**
 * BUTTON COMPONENT
 * ================
 * ForwardRef component untuk support ref forwarding
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Slot pattern: Render sebagai child atau button
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        // Merge variant classes dengan custom className
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}  // Forward ref untuk parent component
        {...props} // Spread semua props lainnya
      />
    )
  }
)
// Display name untuk React DevTools
Button.displayName = "Button"

export { Button, buttonVariants }