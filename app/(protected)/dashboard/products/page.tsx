import type { Metadata } from "next";
// import { Button } from "@/components/ui/button";
// import { PlusCircle } from "lucide-react";
// import Link from "next/link";
// import { ProductsTable } from "@/components/products/products-table";
// import { ProductFilters } from "@/components/products/product-filters";
import { ProductList } from "@/features/products";

export const metadata: Metadata = {
  title: "Quản Lý Sản Phẩm - ProductFlow",
  description: "Quản lý quy trình phát triển sản phẩm",
};

// export default function ProductsPage() {
//   return (
//     <div className="flex flex-col gap-5">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Quản Lý Sản Phẩm
//           </h1>
//           <p className="text-muted-foreground">
//             Quản lý và theo dõi quy trình phát triển sản phẩm
//           </p>
//         </div>
//         <Link href="/dashboard/products/new">
//           <Button className="gap-2">
//             <PlusCircle className="h-4 w-4" />
//             Tạo Sản Phẩm Mới
//           </Button>
//         </Link>
//       </div>

//       <ProductFilters />
//       <ProductsTable />
//     </div>
//   )
// }

export default function Page() {
  return <ProductList />;
}
