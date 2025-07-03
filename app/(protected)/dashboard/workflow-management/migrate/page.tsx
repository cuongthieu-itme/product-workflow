import { MigrateWorkflows } from '@/components/workflow/migrate-workflows'

export default function MigrateWorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Di chuyển dữ liệu quy trình
        </h1>
        <p className="text-muted-foreground mt-2">
          Di chuyển dữ liệu từ collection workflows cũ sang cấu trúc mới
        </p>
      </div>

      <MigrateWorkflows />
    </div>
  )
}
