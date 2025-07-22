import { AccountSettings } from "./account-settings";
import { NotificationSettings } from "./notification-settings";
import { AppearanceSettings } from "./appearance-settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationTab } from "./notification-tab";

export const SettingPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài Đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt tài khoản và hệ thống
        </p>
      </div>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Tài Khoản</TabsTrigger>
          <TabsTrigger value="notification">Thông Báo</TabsTrigger>
          <TabsTrigger value="appearance">Giao Diện</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="notification">
          <NotificationTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
