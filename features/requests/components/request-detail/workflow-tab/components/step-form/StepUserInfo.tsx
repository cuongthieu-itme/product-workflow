import { User } from "lucide-react";

interface StepUserInfoProps {
  user?: {
    fullName?: string;
    email?: string;
  };
}

export const StepUserInfo: React.FC<StepUserInfoProps> = ({ user }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">
        Người thực hiện
      </h4>

      <div className="p-4 rounded-md border bg-muted">
        <div className="flex items-center gap-2">
          <User className="text-blue-600 w-5 h-5" />
          <div>
            <span className="text-sm">
              {user?.fullName || "Chưa có người thực hiện"}
              {user?.email && (
                <span className="text-muted-foreground"> ({user.email})</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
