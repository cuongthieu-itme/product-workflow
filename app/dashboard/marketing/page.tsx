import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { MarketingCampaignsTable } from "@/components/marketing/marketing-campaigns-table"
import { MarketingFilters } from "@/components/marketing/marketing-filters"

export const metadata: Metadata = {
  title: "Marketing & Quản Lý SKU - ProductFlow",
  description: "Quản lý chiến dịch marketing và SKU sản phẩm",
}

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing & Quản Lý SKU</h1>
          <p className="text-muted-foreground">Quản lý chiến dịch marketing và SKU sản phẩm</p>
        </div>
        <Link href="/dashboard/marketing/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Tạo Chiến Dịch Mới
          </Button>
        </Link>
      </div>

      <MarketingFilters />
      <MarketingCampaignsTable />
    </div>
  )
}
