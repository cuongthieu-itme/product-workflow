import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "./components/review-form";
import { ReviewList } from "./components/review-list";
import { TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useGetEvaluatesQuery } from "@/features/requests/hooks/useRequest";
import { useParams } from "next/navigation";

interface Review {
  id: number;
  title: string;
  type: string;
  rating: number;
  content: string;
  createdAt: string;
  author: { name: string } | null;
  likes: number;
  dislikes: number;
  replies: Review[];
  isAnonymous?: boolean;
}

const mockReviews = [
  {
    id: 1,
    title: "Đánh giá về chất lượng sản phẩm",
    type: "quality",
    rating: 4,
    content:
      "Sản phẩm chất lượng tốt, đáp ứng yêu cầu đề ra. Tuy nhiên cần cải thiện thêm về thời gian giao hàng.",
    createdAt: "2025-07-20",
    author: { name: "Nguyễn Văn A" },
    likes: 5,
    dislikes: 1,
    replies: [],
  },
  {
    id: 2,
    title: "Đánh giá về dịch vụ",
    type: "service",
    rating: 5,
    content: "Dịch vụ hỗ trợ khách hàng rất chuyên nghiệp và nhanh chóng.",
    createdAt: "2025-07-19",
    author: null,
    isAnonymous: true,
    likes: 8,
    dislikes: 0,
    replies: [],
  },
];

export const ReviewTab = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetEvaluatesQuery({ requestId: Number(id) });

  return (
    <TabsContent value="reviews" className="space-y-6">
      <ReviewForm />

      <ReviewList reviews={data || []} />
    </TabsContent>
  );
};
