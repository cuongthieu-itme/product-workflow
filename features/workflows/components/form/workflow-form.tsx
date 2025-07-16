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
import { useEffect, useState } from "react";
import { WorkflowInfoForm } from "./workflow-info-form";
import { StepsList } from "./steps-list";
import {
  useCreateOfUpdateWPMutation,
  useGetWorkflowProcessByIdQuery,
} from "../../hooks/useWorkFlowProcess";
import { StepFormModal } from "./step-form-modal";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { convertSubProcessFormData } from "../../helper";
import { WorkflowSkeleton } from "./skeleton";

export function WorkflowForm() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetWorkflowProcessByIdQuery(Number(id));
  const [isCreateStepModalOpen, setIsCreateStepModalOpen] = useState(false);

  const methods = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      subprocesses: [],
    },
  });

  const { control, handleSubmit, setValue } = methods;

  const { fields } = useFieldArray({
    control,
    name: "subprocesses",
    keyName: "fieldId",
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("description", data.description);
      setValue("subprocesses", convertSubProcessFormData(data.subprocesses));
    }
  }, [data]);

  const handleOpenStepModal = () => {
    setIsCreateStepModalOpen(true);
  };

  const handleCreateStep = (stepData: SubProcessInputType) => {
    const newStep = {
      ...stepData,
      step: fields.length + 1,
      fieldId: nanoid(),
    };

    const updatedFields = [...fields, newStep];
    setValue("subprocesses", updatedFields, { shouldValidate: true });
    setIsCreateStepModalOpen(false);
  };

  const {
    mutate: createWorkflowProcess,
    error,
    isSuccess,
  } = useCreateOfUpdateWPMutation();

  const onSubmit: SubmitHandler<CreateWorkflowInputType> = (formData) => {
    const normalizedSubprocesses = formData.subprocesses.map(
      (subprocess, index) => {
        return {
          ...subprocess,
          step: index + 1,
        };
      }
    );

    if (data?.id) {
      createWorkflowProcess({
        id: data.id,
        name: formData.name,
        description: formData.description,
        subprocesses: normalizedSubprocesses,
      });

      return;
    }

    createWorkflowProcess({
      name: formData.name,
      description: formData.description,
      subprocesses: normalizedSubprocesses,
    });
  };

  if (isLoading) return <WorkflowSkeleton />;

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
              {id
                ? "Quy trình đã được cập nhật"
                : "Quy trình đã được tạo thành công"}
            </AlertDescription>
          </Alert>
        )}

        <WorkflowInfoForm />

        <StepsList handleOpenStepModal={handleOpenStepModal} />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Hủy bỏ
          </Button>
          <Button type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {id ? "Cập nhật" : "Tạo quy trình"}
          </Button>
        </div>
      </form>

      <StepFormModal
        isOpen={isCreateStepModalOpen}
        onClose={() => setIsCreateStepModalOpen(false)}
        handleSaveStep={handleCreateStep}
      />
    </FormProvider>
  );
}
