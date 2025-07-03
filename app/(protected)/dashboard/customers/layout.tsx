import type React from 'react'
import { CustomerProvider } from '@/components/customers/customer-context'

export default function CustomersLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <CustomerProvider>{children}</CustomerProvider>
}
