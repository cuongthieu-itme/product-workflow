"use client";

import {
  useForm,
  useFieldArray,
  SubmitHandler,
  FormProvider,
} from "react-hook-form";
import crypto from "crypto";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWorkflowInputSchema,
  CreateWorkflowInputType,
  SubProcessInputType,
} from "../../schema/create-workflow-schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { WorkflowInfoForm } from "./workflow-info-form";
import { StepsList } from "./steps-list";
import { StepModalUpdate } from "./step-modal-update";
import { useCreateWorkflowProcessMutation } from "../../hooks/useWorkFlowProcessQuery";
import { StepModalCreate } from "./step-modal-create";

export function CreateWorkflowProcessForm() {
  const { toast } = useToast();
  const methods = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      subprocesses: [],
    },
  });

  const { control, handleSubmit } = methods;
  const [isUpdateStepModalOpen, setIsUpdateStepModalOpen] = useState(false);
  const [isCreateStepModalOpen, setIsCreateStepModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "subprocesses",
  });

  const handleOpenStepModal = () => {
    setIsCreateStepModalOpen(true);
  };

  const handleCreateStep = (stepData: SubProcessInputType) => {
    append({
      ...stepData,
      step: fields.length + 1,
    });
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

  const { mutate: createWorkflowProcess } = useCreateWorkflowProcessMutation();

  const onSubmit: SubmitHandler<CreateWorkflowInputType> = (data) => {
    const subprocesses = data.subprocesses.map((subprocess) => {
      const { id, ...rest } = subprocess;
      return {
        ...rest,
      };
    });
    createWorkflowProcess({
      ...data,
      subprocesses,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
