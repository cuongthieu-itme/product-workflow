import { MigrationManager } from '@/components/data-migration/migration-manager'

export default function DataMigrationPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Công cụ di chuyển dữ liệu</h1>
      <MigrationManager />
    </div>
  )
}
