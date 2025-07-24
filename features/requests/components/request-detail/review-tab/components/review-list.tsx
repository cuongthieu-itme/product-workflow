import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetEvaluatesQuery } from "@/features/requests/hooks/useRequest";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/features/requests/helpers";
import { TablePagination } from "@/components/data-table/pagination";
import { LIMIT, PAGE } from "@/constants/pagination";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ReviewList = () => {
  const [page, setPage] = useState(PAGE);
  const { id } = useParams<{ id: string }>();
  const { data: reviews, isLoading } = useGetEvaluatesQuery({
    requestId: Number(id),
    page,
    limit: LIMIT,
  });

  const totalPages = useMemo(() => {
    if (!reviews) return 0;
    const { total, limit } = reviews;
    return Math.ceil(total / limit);
  }, [reviews]);

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

  const renderSkeleton = () => (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-muted-foreground/90">
          Danh sách đánh giá
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                {renderSkeleton()}
              </div>
            ))}
          </div>
        ) : !reviews || reviews?.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-4">
              <Star className="w-8 h-8 mx-auto text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground/90">
              Chưa có đánh giá nào
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Hãy là người đầu tiên đánh giá sản phẩm này
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews?.data.map((review) => (
              <div
                key={review.id}
                className={cn(
                  "border rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:bg-muted/50",
                  "border-gray-200",
                  review.score >= 4 ? "border-green-200" : ""
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="font-semibold text-lg text-muted-foreground/90">
                        {review.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm px-3 py-1",
                          review.score >= 4
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {review.reviewType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
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
                    <p className="text-muted-foreground leading-relaxed">
                      {review.title}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p className="font-medium">
                      {review.isAnonymous
                        ? "Ẩn danh"
                        : review.createdBy?.fullName}
                    </p>
                    <p className="text-xs">
                      {formatDate(review?.createdAt, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {review.description}
                </p>
              </div>
            ))}
          </div>
        )}
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
};
