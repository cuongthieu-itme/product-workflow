import { Coins } from "lucide-react";
import { Control } from "react-hook-form";
import { InputCustom } from "@/components/form/input";
import { SubprocessHistoryType } from "@/features/requests/type";

interface StepCostInfoProps {
  step: SubprocessHistoryType;
  control: Control<any>;
  isAssignedUser: boolean;
}

export const StepCostInfo: React.FC<StepCostInfoProps> = ({
  step,
  control,
  isAssignedUser,
}) => {
  if (!step.isStepWithCost) return null;

  return (
    <div className="space-y-4 md:col-span-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Thông tin chi phí
      </h4>

      {isAssignedUser ? (
        <InputCustom
          name="price"
          control={control}
          label="Chi phí thực hiện"
          type="number"
          min={1}
          step={1000}
          placeholder="Nhập chi phí"
          className="w-full"
          labelIcon={<Coins className="text-yellow-600 w-4 h-4" />}
        />
      ) : (
        <div className="p-4 rounded-md border bg-muted">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-600 w-5 h-5" />
            <span className="text-sm font-medium text-muted-foreground">
              Chi phí:
            </span>{" "}
            <span className="text-sm">
              {step.price ? `${step.price.toLocaleString()} đ` : "Chưa có"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
