import { AccountSettings } from '@/components/settings/account-settings'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài Đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt tài khoản và hệ thống
        </p>
      </div>

      <div className="mb-6">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium bg-background text-foreground shadow-sm">
            Tài Khoản
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
            Thông Báo
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
            Giao Diện
          </div>
        </div>
      </div>

      <AccountSettings />
    </div>
  )
}
