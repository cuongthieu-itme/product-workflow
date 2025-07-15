"use client";

import {
  useForm,
  useFieldArray,
  SubmitHandler,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWorkflowInputSchema,
  CreateWorkflowInputType,
  SubProcessInputType,
} from "../../schema/create-workflow-schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { WorkflowInfoForm } from "./workflow-info-form";
import { StepsList } from "./steps-list";
import {
  useCreateWorkflowProcessMutation,
  useGetWorkflowProcessByIdQuery,
} from "../../hooks/useWorkFlowProcessQuery";
import { StepModalCreate } from "./step-modal-create";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function CreateWorkflowProcessForm() {
  const params = useParams();
  const { toast } = useToast();
  const { data, isLoading } = useGetWorkflowProcessByIdQuery(Number(params.id));

  const methods = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    mode: "onChange",
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      subprocesses: data?.subprocesses ?? [],
    },
  });

  const { control, handleSubmit, setValue } = methods;
  const [isCreateStepModalOpen, setIsCreateStepModalOpen] = useState(false);

  const { fields, remove } = useFieldArray({
    control,
    name: "subprocesses",
    keyName: "id",
  });

  const handleOpenStepModal = () => {
    setIsCreateStepModalOpen(true);
  };

  const handleCreateStep = (stepData: SubProcessInputType) => {
    const newStep = {
      ...stepData,
      step: fields.length + 1,
      id: nanoid(),
    };

    const updatedFields = [...fields, newStep];
    setValue("subprocesses", updatedFields, { shouldValidate: true });
    setIsCreateStepModalOpen(false);
  };

  const handleRemoveStep = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: "Cảnh báo",
        description: "Quy trình phải có ít nhất 1 bước",
        variant: "destructive",
      });
    }
  };

  const {
    mutate: createWorkflowProcess,
    error,
    isSuccess,
  } = useCreateWorkflowProcessMutation();

  const onSubmit: SubmitHandler<CreateWorkflowInputType> = (data) => {
    if (params.id) {
      console.log("DATA: ", data);
      return;
    }

    // Gửi dữ liệu nguyên vẹn, bao gồm id
    createWorkflowProcess(data);
  };

  if (isLoading)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Thành công!</AlertTitle>
            <AlertDescription className="text-green-700">
              Quy trình đã được tạo thành công.
            </AlertDescription>
          </Alert>
        )}

        <WorkflowInfoForm />

        <StepsList
          handleOpenStepModal={handleOpenStepModal}
          onRemoveStep={handleRemoveStep}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Hủy bỏ
          </Button>
          <Button type="submit">Tạo quy trình</Button>
        </div>
      </form>

      <StepModalCreate
        isOpen={isCreateStepModalOpen}
        onClose={() => setIsCreateStepModalOpen(false)}
        handleSaveStep={handleCreateStep}
      />
    </FormProvider>
  );
}
