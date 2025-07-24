import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EvaluateType } from "@/features/requests/type";

interface ReviewListProps {
  reviews: EvaluateType[];
}

export const ReviewList = ({ reviews }: ReviewListProps) => {
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
                      <Badge variant="outline">{review.reviewType}</Badge>
                    </div>
                    {renderStarRating(review.score)}
                  </div>
                  {/* <div className="text-right text-sm text-muted-foreground">
                    <p>{review.user?.name || "Ẩn danh"}</p>
                    <p>
                      {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div> */}
                </div>

                <p className="text-gray-700 mb-3">{review.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
