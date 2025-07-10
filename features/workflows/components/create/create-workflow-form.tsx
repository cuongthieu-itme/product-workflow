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
  StepInputType,
} from "../../schema/create-workflow-schema";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Edit, FileText } from "lucide-react";
import { WorkflowInfoForm } from "./workflow-info-form";
import { StepsList } from "./steps-list";
import { StepModal } from "./step-modal";

export function CreateWorkflowProcessForm() {
  const { toast } = useToast();
  const methods = useForm<CreateWorkflowInputType>({
    resolver: zodResolver(createWorkflowInputSchema),
    defaultValues: {
      name: "",
      description: "",
      steps: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const { fields } = useFieldArray({
    control,
    name: "steps",
  });

  const handleAddStep = () => {
    setIsStepModalOpen(true);
    setEditingStepIndex(null);
  };

  const handleEditStep = (index: number) => {
    setIsStepModalOpen(true);
    setEditingStepIndex(index);
  };

  const handleSaveStep = (stepData: StepInputType) => {
    if (editingStepIndex !== null) {
      setValue(`steps.${editingStepIndex}`, stepData);
    } else {
      setValue("steps", [...fields, stepData]);
    }
    setIsStepModalOpen(false);
  };

  const handleRemoveStep = (index: number) => {
    if (fields.length > 1) {
      setValue("steps", [
        ...fields.slice(0, index),
        ...fields.slice(index + 1),
      ]);
    } else {
      toast({
        title: "Cảnh báo",
        description: "Phải có ít nhất 1 bước trong quy trình",
        variant: "destructive",
      });
    }
  };

  const onSubmit: SubmitHandler<CreateWorkflowInputType> = (data) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <WorkflowInfoForm />

        <StepsList
          onAddStep={handleAddStep}
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
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        onSave={handleSaveStep}
        editingStep={
          editingStepIndex !== null ? fields[editingStepIndex] : undefined
        }
      />
    </FormProvider>
  );
}
