import { ReviewForm } from "./components/review-form";
import { ReviewList } from "./components/review-list";
import { TabsContent } from "@/components/ui/tabs";

export const ReviewTab = () => {
  return (
    <TabsContent value="reviews" className="space-y-6">
      <ReviewForm />

      <ReviewList />
    </TabsContent>
  );
};
