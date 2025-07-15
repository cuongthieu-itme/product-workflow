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
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function CreateWorkflowProcessForm() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const { toast } = useToast();
  const { data, isLoading } = useGetWorkflowProcessByIdQuery(
    Number(workflowId)
  );
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

  const { fields, remove } = useFieldArray({
    control,
    name: "subprocesses",
    keyName: "id",
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("description", data.description);
      setValue("subprocesses", data.subprocesses);
    }
  }, [data]);

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

  const onSubmit: SubmitHandler<CreateWorkflowInputType> = (formData) => {
    const normalizedSubprocesses = formData.subprocesses.map((subprocess) => {
      if (typeof subprocess.id === "string") {
        return {
          ...subprocess,
        };
      }

      return subprocess;
    });

    if (data?.id) {
      console.log("DATA: ", {
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
          <Button type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {workflowId ? "Cập nhật" : "Tạo quy trình"}
          </Button>
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
