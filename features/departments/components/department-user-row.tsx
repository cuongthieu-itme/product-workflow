import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/features/users/type";
import { UserCog } from "lucide-react";
import Link from "next/link";
import React from "react";

interface DepartmentUserRowProps {
  user: User;
  isHead?: boolean;
}

export const DepartmentUserRow: React.FC<DepartmentUserRowProps> = ({
  user,
  isHead,
}) => {
  return (
    <div
      key={user.id}
      className={`flex items-center justify-between p-3 border rounded-md ${
        isHead ? "bg-primary/5 border-primary/20" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold">
            {user.fullName.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <p className="text-sm text-muted-foreground">
            SĐT: {user.phoneNumber || "Chưa cập nhật"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isHead && (
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20"
          >
            Trưởng phòng
          </Badge>
        )}
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/users/${user.id}`}>
            <UserCog className="h-4 w-4 mr-1" />
            Chi tiết
          </Link>
        </Button>
      </div>
    </div>
  );
};
