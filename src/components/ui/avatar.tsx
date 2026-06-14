import type { ComponentPropsWithoutRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ring-1 ring-foreground/[0.08]",
  {
    variants: {
      size: {
        sm: "size-6 text-[10px]",
        md: "size-8 text-xs",
        lg: "size-10 text-[15px]",
        xl: "size-14 text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

/** Paletas deterministas, todas en tokens semánticos (sin hex crudos). */
const TINTS = [
  "bg-secondary text-secondary-foreground",
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-success text-success-foreground",
] as const

interface AvatarProps
  extends ComponentPropsWithoutRef<"span">,
    VariantProps<typeof avatarVariants> {
  name?: string
  src?: string
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
}

function Avatar({ name = "", src, size, className, ...props }: AvatarProps) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const tint = TINTS[hash % TINTS.length]

  return (
    <span
      data-slot="avatar"
      aria-label={name || undefined}
      className={cn(avatarVariants({ size }), !src && tint, className)}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}

export { Avatar, avatarVariants }
