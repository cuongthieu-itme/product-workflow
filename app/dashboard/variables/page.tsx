import { VariablesTable } from "@/components/variables/variables-table"
import { AvailableVariablesProvider } from "@/components/variables/available-variables-context"

export default function VariablesPage() {
  return (
    <AvailableVariablesProvider>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Quản lý trường dữ liệu</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các trường dữ liệu có sẵn để sử dụng trong quy trình và form.
          </p>
        </div>
        <VariablesTable />
      </div>
    </AvailableVariablesProvider>
  )
}
