import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  useUsersQuery,
  useGetUserNoDepartmentsQuery,
} from "@/features/users/hooks/useUsersQuery";
import { useAssignUserToStepMutation } from "@/features/requests/hooks/useRequest";
import { SubprocessHistoryType } from "@/features/requests/type";

interface AdminUserAssignmentProps {
  step: SubprocessHistoryType;
  selectedUserId: number | undefined;
  setSelectedUserId: (userId: number | undefined) => void;
  isSubmitting: boolean;
}

export const AdminUserAssignment: React.FC<AdminUserAssignmentProps> = ({
  step,
  selectedUserId,
  setSelectedUserId,
  isSubmitting,
}) => {
  const { data: users } = useUsersQuery({ departmentId: step.departmentId });
  const { mutate: assignUserToStep } = useAssignUserToStepMutation();
  const { toast } = useToast();

  return (
    <div className="p-4 rounded-md border bg-card shadow-sm">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
        <User className="text-primary w-5 h-5" />
        Gán người thực hiện
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={selectedUserId?.toString()}
            onValueChange={(value) => {
              const userId = Number(value);
              setSelectedUserId(userId);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Chọn người thực hiện cho bước này" />
            </SelectTrigger>
            <SelectContent>
              {users?.data?.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.fullName} ({user.userName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!!selectedUserId && selectedUserId !== step.userId && (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (selectedUserId) {
                  assignUserToStep(
                    {
                      id: step.id,
                      userId: selectedUserId,
                      isRequired: step.isRequired,
                      isStepWithCost: step.isStepWithCost,
                    },
                    {
                      onSuccess: () => {
                        toast({
                          title: "Thành công",
                          description: "Đã gán người thực hiện cho bước này!",
                        });
                      },
                      onError: () => {
                        toast({
                          title: "Thất bại",
                          description: "Có lỗi xảy ra khi gán người thực hiện",
                          variant: "destructive",
                        });
                      },
                    }
                  );
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4 mr-2" />
              Gán người thực hiện
            </Button>
          )}
        </div>

        {!!selectedUserId && selectedUserId === step.userId && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
            💡 Người này đã được gán cho bước này
          </div>
        )}
      </div>
    </div>
  );
};
