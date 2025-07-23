import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "./components/review-form";
import { ReviewList } from "./components/review-list";
import { TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";

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
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleAddReview = (review: any) => {
    setIsLoadingReviews(true);
    setTimeout(() => {
      const newId = mockReviews.length + 1;
      const newReviewData = {
        ...review,
        id: newId,
        createdAt: new Date().toISOString(),
        author: review.isAnonymous ? null : { name: "Người đánh giá" },
        likes: 0,
        dislikes: 0,
        replies: [],
      };
      mockReviews.push(newReviewData);
      setIsLoadingReviews(false);
    }, 1000);
  };

  const handleReviewReaction = (reviewId: number, type: "like" | "dislike") => {
    const updatedReviews = mockReviews.map((review) => {
      if (review.id === reviewId) {
        const count =
          type === "like"
            ? (review.likes || 0) + 1
            : (review.dislikes || 0) + 1;
        return {
          ...review,
          [type === "like" ? "likes" : "dislikes"]: count,
        };
      }
      return review;
    });
    // In a real implementation, you would update the state here
  };

  return (
    <TabsContent value="reviews" className="space-y-6">
      <ReviewForm onSubmit={handleAddReview} isLoading={isLoadingReviews} />

      <ReviewList
        reviews={mockReviews}
        onLike={(id) => handleReviewReaction(id, "like")}
        onDislike={(id) => handleReviewReaction(id, "dislike")}
        onReply={setReplyingTo}
      />
    </TabsContent>
  );
};
