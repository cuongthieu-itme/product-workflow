"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GripVertical,
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { CreateWorkflowInputType } from "../../schema/create-workflow-schema";
import { Button } from "@/components/ui/button";

interface StepsListProps {
  onAddStep: () => void;
  onEditStep: (index: number) => void;
  onRemoveStep: (index: number) => void;
}

export function StepsList({
  onAddStep,
  onEditStep,
  onRemoveStep,
}: StepsListProps) {
  const { control } = useFormContext<CreateWorkflowInputType>();
  const { fields, move } = useFieldArray({
    control,
    name: "steps",
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bước thực hiện</h3>
        <Button onClick={onAddStep} variant="outline">
          Thêm bước
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {fields.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-muted/30">
                  <p className="text-muted-foreground">
                    Chưa có bước nào trong quy trình
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((step, index) => (
                    <Draggable
                      key={step.id}
                      draggableId={step.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            step.stepRequired ? "border-primary/50" : ""
                          }`}
                        >
                          <CardHeader className="flex flex-row items-center justify-between py-3">
                            <div className="flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                                title="Kéo để sắp xếp lại"
                              >
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-full w-8 h-8">
                                <span className="text-sm font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                  {step.name}
                                  {step.stepRequired && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      Bắt buộc
                                    </Badge>
                                  )}
                                  {step.stepWithCost && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal bg-green-50"
                                    >
                                      <DollarSign className="h-3 w-3 mr-1" />{" "}
                                      Chi phí
                                    </Badge>
                                  )}
                                </CardTitle>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> Trường dữ
                                liệu
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEditStep(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => onRemoveStep(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Mô tả
                                </p>
                                <p className="text-sm">
                                  {step.description || "Không có mô tả"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" /> Thời
                                  gian ước tính
                                </p>
                                <p className="text-sm">
                                  {step.estimatedDays} ngày
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <User className="h-3 w-3 mr-1" /> Người đảm
                                  nhiệm
                                </p>
                                <p className="text-sm">
                                  {step.roleUserEnsure || "Chưa xác định"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
