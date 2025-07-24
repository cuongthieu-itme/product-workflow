import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { EvaluateInputType } from "@/features/requests/schema";
import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { useParams } from "next/navigation";
import { InputCustom } from "@/components/form/input";
import { TextAreaCustom } from "@/components/form/textarea";
import { useCreateEvaluateMutation } from "@/features/requests/hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";

export const ReviewForm = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useGetUserInfoQuery();
  const { control, handleSubmit, setValue } = useForm<EvaluateInputType>({
    defaultValues: {
      createdById: user?.id,
      requestId: Number(id),
      description: "",
      score: 0,
      reviewType: "",
      title: "",
      isAnonymous: false,
    },
  });

  const { mutate, isPending, reset } = useCreateEvaluateMutation();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<EvaluateInputType> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đánh giá đã được thêm thành công",
        });
        reset();
      },
      onError: () => {
        toast({
          title: "Thất bại",
          description: "Có lỗi xảy ra khi thêm đánh giá",
          variant: "destructive",
        });
      },
    });
  };

  const handleRatingChange = (rating: number) => {
    setValue("score", rating);
  };

  const renderStarRating = (rating: number, isEditable = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => isEditable && handleRatingChange(star)}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <Star />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Thêm đánh giá mới</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCustom
              name="title"
              control={control}
              label="Tiêu đề đánh giá"
              required
              placeholder="Nhập tiêu đề đánh giá..."
            />
            <InputCustom
              name="reviewType"
              control={control}
              label="Loại đánh giá"
              required
              placeholder="Nhập loại đánh giá..."
            />
          </div>

          <Controller
            name="score"
            control={control}
            render={({ field }) => (
              <div>
                <Label>Đánh giá sao</Label>
                {renderStarRating(field.value, true)}
              </div>
            )}
          />

          <TextAreaCustom
            name="description"
            control={control}
            label="Nội dung đánh giá"
            placeholder="Nhập nội dung đánh giá..."
          />

          <Controller
            name="isAnonymous"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    setValue("isAnonymous", !!checked)
                  }
                />
                <Label htmlFor="anonymous">Đánh giá ẩn danh</Label>
              </div>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang thêm..." : "Thêm đánh giá"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};
