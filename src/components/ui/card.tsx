/**
 * CARD COMPONENT (UI)
 * ===================
 * Composable card components untuk layout dan content organization
 * 
 * Built with:
 * - React ForwardRef untuk ref support
 * - Tailwind CSS untuk styling
 * - Shadcn/ui design system
 * 
 * Components:
 * - Card: Container utama dengan border dan shadow
 * - CardHeader: Header section dengan padding
 * - CardTitle: Title dengan typography yang sesuai
 * - CardDescription: Subtitle/description text
 * - CardContent: Main content area
 * - CardFooter: Footer section untuk actions
 * 
 * Design Pattern: Composition
 * Semua components bisa dikombinasikan sesuai kebutuhan
 * 
 * Usage:
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Main content here
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 * 
 * Features:
 * - Fully composable (pilih component yang dibutuhkan)
 * - Responsive design
 * - Accessible dengan semantic HTML
 * - Type-safe dengan TypeScript
 * - ForwardRef support untuk ref forwarding
 */

import * as React from "react"

import { cn } from "@/lib/utils"

// === CARD PROPS ===
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CARD COMPONENT
 * ==============
 * Main container dengan border, shadow, dan rounded corners
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

/**
 * CARD HEADER
 * ===========
 * Header section dengan vertical spacing dan padding
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CARD TITLE
 * ==========
 * Title dengan typography (2xl, semibold, tight leading)
 * Rendered sebagai h3 untuk semantic HTML
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CARD DESCRIPTION
 * ================
 * Subtitle/description dengan muted color
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CARD CONTENT
 * ============
 * Main content area dengan padding (no top padding)
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CARD FOOTER
 * ===========
 * Footer section untuk actions/buttons dengan flexbox layout
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Export semua components untuk digunakan
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }