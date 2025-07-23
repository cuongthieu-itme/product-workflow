import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}

interface ReviewListProps {
  reviews: Review[];
  onLike: (reviewId: number) => void;
  onDislike: (reviewId: number) => void;
  onReply: (reviewId: number) => void;
}

export const ReviewList = ({
  reviews,
  onLike,
  onDislike,
  onReply,
}: ReviewListProps) => {
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <Star />
          </span>
        ))}
      </div>
    );
  };

  const getReviewTypeLabel = (type: string) => {
    const labels = {
      general: "Tổng quan",
      design: "Thiết kế",
      quality: "Chất lượng",
      price: "Giá cả",
      timing: "Thời gian",
      service: "Dịch vụ",
    };
    return labels[type as keyof typeof labels] || "Không xác định";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách đánh giá</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{review.title}</h4>
                      <Badge variant="outline">
                        {getReviewTypeLabel(review.type)}
                      </Badge>
                    </div>
                    {renderStarRating(review.rating)}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{review.author?.name || "Ẩn danh"}</p>
                    <p>
                      {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{review.content}</p>

                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => onLike(review.id)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                  >
                    <ThumbsUp className="w-4 h-4" /> {review.likes}
                  </button>
                  <button
                    onClick={() => onDislike(review.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="w-4 h-4" /> {review.dislikes}
                  </button>
                  <button
                    onClick={() => onReply(review.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Phản hồi
                  </button>
                </div>

                {review.replies?.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {reply.author?.name || "Ẩn danh"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(reply.createdAt),
                                  "dd/MM/yyyy HH:mm"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
