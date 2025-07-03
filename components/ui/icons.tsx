'use client'

import type React from 'react'

import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

// Thêm icon Workflow cho sidebar
export const Workflow = forwardRef<
  SVGSVGElement,
  React.ComponentProps<LucideIcon>
>(({ color = 'currentColor', size = 24, strokeWidth = 2, ...props }, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="9" y="15" width="6" height="6" rx="1" />
    <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
  </svg>
))
Workflow.displayName = 'Workflow'
