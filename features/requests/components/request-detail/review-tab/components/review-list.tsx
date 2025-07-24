import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetEvaluatesQuery } from "@/features/requests/hooks/useRequest";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/features/requests/helper";

export const ReviewList = () => {
  const { id } = useParams<{ id: string }>();
  const { data: reviews } = useGetEvaluatesQuery({ requestId: Number(id) });

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
        <CardTitle className="text-xl font-bold">Danh sách đánh giá</CardTitle>
      </CardHeader>
      <CardContent>
        {!reviews || reviews?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg font-semibold">Chưa có đánh giá nào</p>
            <p className="text-sm text-muted-foreground mt-2">
              Hãy là người đầu tiên đánh giá sản phẩm này
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews?.map((review) => (
              <div
                key={review.id}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-muted/50",
                  review.score >= 4 ? "border-green-200" : "border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{review.title}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm",
                          review.score >= 4
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {review.reviewType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {renderStarRating(review.score)}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          review.score >= 4 ? "text-green-600" : "text-gray-600"
                        )}
                      >
                        ({review.score}/5)
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p className="font-medium">
                      {review.isAnonymous
                        ? "Ẩn danh"
                        : review.createdBy?.fullName}
                    </p>
                    <p className="text-xs">{formatDate(review?.createdAt)}</p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {review.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
