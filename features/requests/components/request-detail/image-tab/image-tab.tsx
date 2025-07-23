import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Mock data for testing
const mockImages = [
  "https://picsum.photos/200/200?random=1",
  "https://picsum.photos/200/200?random=2",
  "https://picsum.photos/200/200?random=3",
];

export const ImageTab = () => {
  // For demonstration purposes, using mock data
  const currentRequest = {
    images: mockImages,
    id: "mock-request-1",
  };

  const updateRequestImages = (newImages: string[]) => {
    console.log("Updating images:", newImages);
  };

  return (
    <TabsContent value="images">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hình ảnh yêu cầu
          </CardTitle>
          <CardDescription>
            Quản lý hình ảnh liên quan đến yêu cầu này
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Thêm hình ảnh
                </h3>
                <p className="text-gray-500 mb-4">
                  Kéo thả hoặc click để chọn hình ảnh
                </p>
                <div className="p-4 text-center text-gray-500">
                  MultiImageUpload component placeholder
                </div>
              </div>
            </div>

            {/* Current Images */}
            {currentRequest.images && currentRequest.images.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">
                  Hình ảnh hiện tại ({currentRequest.images.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentRequest.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={imageUrl}
                          alt={`Hình ảnh ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newImages = currentRequest.images.filter(
                              (_, i) => i !== index
                            );
                            updateRequestImages(newImages);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!currentRequest.images ||
              (currentRequest.images.length === 0 && (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có hình ảnh nào</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
