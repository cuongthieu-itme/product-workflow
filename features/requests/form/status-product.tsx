import { Label } from "@/components/ui/label";
import { RequestInputType } from "../schema";
import { useFormContext } from "react-hook-form";
import { SelectCustom } from "@/components/form/select";
import {
  useProductsStatusQuery,
  useProductStatusQuery,
} from "@/features/products-status/hooks";
import { useGetWorkflowProcessByIdQuery } from "@/features/workflows/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const StatusProduct = () => {
  const { control, watch } = useFormContext<RequestInputType>();
  const { data: statusProducts } = useProductsStatusQuery({ limit: 1000 });
  const selectedStatusId = watch("statusProductId");

  const options =
    statusProducts?.data.map((status) => ({
      value: status.id,
      label: status.name,
    })) || [];

  const { data } = useProductStatusQuery(selectedStatusId);

  const { data: workflowProcess } = useGetWorkflowProcessByIdQuery(
    data?.data.procedure.id
  );

  return (
    <div className="space-y-2">
      <SelectCustom
        control={control}
        name="statusProductId"
        label="Trạng thái sản phẩm"
        options={options}
      />

      {selectedStatusId && (
        <Card className="p-4">
          {workflowProcess ? (
            <Label className="mb-2">Quy trình công việc:</Label>
          ) : (
            <Label className="mb-2">
              Chưa có quy trình công việc cho trạng thái này
            </Label>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Các bước quy trình</CardTitle>
              <CardDescription>
                {workflowProcess?.subprocesses?.length} bước • Tiến độ: 0%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="space-y-6">
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-max">
                    {workflowProcess?.subprocesses?.map(
                      (step: any, index: number) => {
                        // const stepStatus = getStepStatus(step.id);
                        // const isSelected = selectedStep?.id === step.id;

                        return (
                          <div key={step.id} className="flex items-center">
                            <div
                            // className={getStepButtonStyle(
                            //   stepStatus,
                            //   isSelected
                            // )}
                            // onClick={() => setSelectedStep(step)}
                            >
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {/* {stepStatus === "completed" ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : stepStatus === "in_progress" ? (
                                  <AlertCircle className="h-5 w-5" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )} */}
                                <span className="font-medium">{step.name}</span>
                              </div>
                              <div className="text-xs">
                                {/* {getStepStatusText(stepStatus)} */}
                              </div>
                            </div>
                            {/* {index < visibleSteps.length - 1 && (
                              <ChevronRight className="h-5 w-5 text-gray-400 mx-2 flex-shrink-0" />
                            )} */}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};
