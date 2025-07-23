import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";

interface ReviewFormProps {
  onSubmit: (review: Review) => void;
  isLoading: boolean;
}

interface Review {
  title: string;
  type: string;
  rating: number;
  content: string;
  isAnonymous: boolean;
}

export const ReviewForm = ({ onSubmit, isLoading }: ReviewFormProps) => {
  const [review, setReview] = useState<Review>({
    title: "",
    type: "general",
    rating: 0,
    content: "",
    isAnonymous: false,
  });

  const handleRatingChange = (rating: number) => {
    setReview((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = () => {
    onSubmit(review);
    setReview({
      title: "",
      type: "general",
      rating: 0,
      content: "",
      isAnonymous: false,
    });
  };

  const renderStarRating = (rating: number, isEditable = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
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
      <CardHeader>
        <CardTitle>Thêm đánh giá mới</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="review-title">Tiêu đề đánh giá</Label>
            <Input
              id="review-title"
              value={review.title}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Nhập tiêu đề đánh giá..."
            />
          </div>
          <div>
            <Label htmlFor="review-type">Loại đánh giá</Label>
            <Select
              value={review.type}
              onValueChange={(value) =>
                setReview((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Tổng quan</SelectItem>
                <SelectItem value="design">Thiết kế</SelectItem>
                <SelectItem value="quality">Chất lượng</SelectItem>
                <SelectItem value="price">Giá cả</SelectItem>
                <SelectItem value="timing">Thời gian</SelectItem>
                <SelectItem value="service">Dịch vụ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Đánh giá sao</Label>
          {renderStarRating(review.rating, true)}
        </div>

        <div>
          <Label htmlFor="review-content">Nội dung đánh giá</Label>
          <Textarea
            id="review-content"
            value={review.content}
            onChange={(e) =>
              setReview((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Nhập nội dung đánh giá..."
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={review.isAnonymous}
            onCheckedChange={(checked) =>
              setReview((prev) => ({ ...prev, isAnonymous: !!checked }))
            }
          />
          <Label htmlFor="anonymous">Đánh giá ẩn danh</Label>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Đang thêm..." : "Thêm đánh giá"}
        </Button>
      </CardContent>
    </Card>
  );
};
