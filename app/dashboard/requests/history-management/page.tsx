import { HistoryCollectionInitializer } from "@/components/requests/history-collection-initializer"

export default function HistoryManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Lịch sử Yêu cầu</h1>
        <p className="text-muted-foreground mt-2">
          Kiểm tra và quản lý collection lịch sử cho các yêu cầu trong hệ thống.
        </p>
      </div>

      <HistoryCollectionInitializer />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Hướng dẫn</h2>
        <div className="prose max-w-none">
          <p>
            Collection lịch sử (<code>requestHistory</code>) được sử dụng để lưu trữ tất cả các thay đổi liên quan đến
            yêu cầu trong hệ thống. Điều này giúp theo dõi ai đã thực hiện thay đổi gì và khi nào.
          </p>
          <h3>Cấu trúc dữ liệu</h3>
          <ul>
            <li>
              <strong>id</strong>: ID duy nhất của bản ghi lịch sử
            </li>
            <li>
              <strong>requestId</strong>: ID của yêu cầu liên quan
            </li>
            <li>
              <strong>userId</strong>: ID của người dùng thực hiện thay đổi
            </li>
            <li>
              <strong>userName</strong>: Tên người dùng
            </li>
            <li>
              <strong>timestamp</strong>: Thời gian thực hiện thay đổi
            </li>
            <li>
              <strong>action</strong>: Loại hành động (create, update, delete, revert, complete, reject, hold)
            </li>
            <li>
              <strong>entityType</strong>: Loại đối tượng bị thay đổi (request, workflow, step, material, comment)
            </li>
            <li>
              <strong>entityId</strong>: ID của đối tượng bị thay đổi
            </li>
            <li>
              <strong>changes</strong>: Chi tiết các thay đổi (trường, giá trị cũ, giá trị mới)
            </li>
            <li>
              <strong>details</strong>: Mô tả chi tiết về thay đổi
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
