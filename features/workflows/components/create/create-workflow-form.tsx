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
  StepInputType,
} from "../../schema/create-workflow-schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { WorkflowInfoForm } from "./workflow-info-form";
import { StepsList } from "./steps-list";
import { StepModal } from "./step-modal";
import { useCreateWorkflowProcessMutation } from "../../hooks/useWorkFlowProcessQuery";

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
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "subprocesses",
  });

  console.log("fields", fields);

  const handleOpenStepModal = () => {
    setIsStepModalOpen(true);
    setStepIndex(fields.length);
  };

  const handleCloseStepModal = () => {
    setIsStepModalOpen(false);
    setStepIndex(0);
  };

  const handleEditStep = (index: number) => {
    setIsStepModalOpen(true);
    setStepIndex(index);
  };

  const handleSaveStep = (stepData: StepInputType) => {
    const newStepData = {
      ...stepData,
      step: stepIndex + 1,
    };

    // Clear the form before appending to prevent duplication
    if (stepIndex === fields.length) {
      append(newStepData);
    } else {
      update(stepIndex, newStepData);
    }

    // Close the modal after saving
    handleCloseStepModal();
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
          onEditStep={handleEditStep}
          onRemoveStep={handleRemoveStep}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Hủy bỏ
          </Button>
          <Button type="submit">Tạo quy trình</Button>
        </div>
      </form>

      <StepModal
        stepIndex={stepIndex}
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        handleSaveStep={handleSaveStep}
        editingStep={fields[stepIndex]}
      />
    </FormProvider>
  );
}
