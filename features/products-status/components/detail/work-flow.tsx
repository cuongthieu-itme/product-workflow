import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRequestsQuery } from "@/features/requests/hooks";
import { useGetWorkflowProcessByIdQuery } from "@/features/workflows/hooks";
import { AlertCircle, Clock } from "lucide-react";
import { useState } from "react";

export function WorkFlow({ procedureId }: { procedureId: number }) {
  const { data: procedure, isLoading: isProcedureLoading } =
    useGetWorkflowProcessByIdQuery(procedureId);
  const { data: request, isLoading: isRequestLoading } = useGetRequestsQuery({
    limit: 10000,
    procedureId: procedureId,
  });
  const [selectedRequestId, setSelectedRequestId] = useState<
    string | undefined
  >(request?.data[0]?.id.toString() || undefined);

  const isLoading = isProcedureLoading || isRequestLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="relative pl-8 pb-4">
                <div className="absolute left-0 top-0">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-2 flex items-center gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Select
        value={selectedRequestId}
        onValueChange={(value) => {
          setSelectedRequestId(value);
        }}
      >
        {request?.data?.map((req) => (
          <SelectItem key={req.id} value={String(req.id)}>
            {req.title}
          </SelectItem>
        ))}
      </Select>

      <CardHeader>
        <CardTitle className="text-lg">Các bước trong quy trình</CardTitle>
        <CardDescription>
          {procedure?.subprocesses
            ? `Danh sách các bước được chọn cho quy trình "${procedure.name}"`
            : "Tất cả các bước trong quy trình chuẩn"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {procedure?.subprocesses && procedure?.subprocesses?.length > 0 ? (
            procedure?.subprocesses.map((step, index) => {
              return (
                <div key={step.id} className="relative pl-8 pb-4">
                  {index < procedure?.subprocesses.length - 1 && (
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                  )}

                  <div className="absolute left-0 top-0">
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                  </div>

                  <div className={`border rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{step.name}</h4>
                      <Badge variant="outline">
                        {step ? "Hoàn thành" : "Chưa hoàn thành"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{step.estimatedNumberOfDays || 1} ngày</span>
                      </div>
                      {step.roleOfThePersonInCharge && (
                        <div className="flex items-center gap-1">
                          <span>Vai trò: {step.roleOfThePersonInCharge}</span>
                        </div>
                      )}
                      {step.isStepWithCost && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Có chi phí</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Không có bước nào trong quy trình
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
