import {
  Loader2,
  CircleSlash,
  Play,
  ShoppingCart,
  Clock,
  Pause,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubprocessHistoryType, StatusSubprocessHistory } from "@/features/requests/type";
import { HoldSubprocessDialog } from "../hold-subprocess-dialog";

interface StepFormActionsProps {
  step: SubprocessHistoryType;
  isSubmitting: boolean;
  isAdmin: boolean;
  isAssignedUser: boolean;
  hasStartTime: boolean;
  isStep1: boolean;
  completeMode: boolean;
  approveMode: boolean;
  holdInfo: {
    canHold: boolean;
    canContinue: boolean;
    isCurrentlyOnHold: boolean;
    nextAction: string;
  };
  onSkipStep: () => void;
  onStartTime: () => void;
  onMaterialRequest: () => void;
  onContinueSubprocess: () => void;
  onApproveStep: () => void;
  setCompleteMode: (value: boolean) => void;
  setApproveMode: (value: boolean) => void;
}

export const StepFormActions: React.FC<StepFormActionsProps> = ({
  step,
  isSubmitting,
  isAdmin,
  isAssignedUser,
  hasStartTime,
  isStep1,
  completeMode,
  approveMode,
  holdInfo,
  onSkipStep,
  onStartTime,
  onMaterialRequest,
  onContinueSubprocess,
  onApproveStep,
  setCompleteMode,
  setApproveMode,
}) => {
  return (
    <div className="mt-6 border-t pt-4 flex justify-between items-center">
      <div className="space-x-2">
        {!step.isRequired && (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onSkipStep}
            variant="outline"
            className="border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            {isSubmitting && !completeMode ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CircleSlash className="w-4 h-4 mr-2 text-red-500" />
            )}
            Bỏ qua
          </Button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {/* Button Start Time - chỉ hiển thị nếu chưa có startTime */}
        {!hasStartTime && (isAdmin || isAssignedUser) && (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onStartTime}
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Bắt đầu
          </Button>
        )}

        {/* Button Yêu cầu mua nguyên vật liệu - chỉ hiển thị ở step 1 */}
        {isStep1 && (isAdmin || isAssignedUser) && (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onMaterialRequest}
            variant="outline"
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Yêu cầu mua NVL
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={() => setCompleteMode(false)}
          variant="outline"
          className="flex items-center"
        >
          {isSubmitting && !completeMode ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Clock className="w-4 h-4 mr-2" />
          )}
          Lưu thông tin
        </Button>

        {/* Button Hold - Hiển thị khi có thể hold */}
        {(isAdmin || isAssignedUser || hasStartTime) && holdInfo.canHold && (
          <HoldSubprocessDialog subprocessId={step.id} disabled={isSubmitting}>
            <Button
              disabled={isSubmitting}
              variant="secondary"
              className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
            >
              <Pause className="w-4 h-4 mr-2" />
              {holdInfo.nextAction === "hold1" && "Tạm dừng (1/3)"}
              {holdInfo.nextAction === "hold2" && "Tạm dừng (2/3)"}
              {holdInfo.nextAction === "hold3" && "Tạm dừng (3/3)"}
            </Button>
          </HoldSubprocessDialog>
        )}

        {/* Button Continue - Hiển thị khi có thể continue */}
        {(isAdmin || isAssignedUser) && holdInfo.canContinue && (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onContinueSubprocess}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            {holdInfo.nextAction === "continue1" && "Tiếp tục 1"}
            {holdInfo.nextAction === "continue2" && "Tiếp tục 2"}
            {holdInfo.nextAction === "continue3" && "Tiếp tục 3"}
          </Button>
        )}

        {/* Button Hoàn thành - Ẩn khi đang hold */}
        {(isAdmin || isAssignedUser) && !holdInfo.isCurrentlyOnHold && (
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setCompleteMode(true)}
            variant="default"
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            {isSubmitting && completeMode ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Hoàn thành
          </Button>
        )}

        {isAdmin &&
          step.status === StatusSubprocessHistory.COMPLETED &&
          !step.isApproved && (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setApproveMode(true);
                onApproveStep();
              }}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 flex items-center"
            >
              {isSubmitting && approveMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BadgeCheck className="w-4 h-4 mr-2" />
              )}
              Phê duyệt
            </Button>
          )}
      </div>
    </div>
  );
};
