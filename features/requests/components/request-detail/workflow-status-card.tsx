"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Package,
  FileText,
  Calendar,
  Eye,
} from "lucide-react";
import {
  RequestStatus,
  SubprocessHistoryType,
  RequestDetail,
} from "../../type";
import {
  calculateCompletionPercentage,
  calculateCurrentStep,
  getStatusText,
  formatDate,
} from "../../helpers";
import { BaseDialog } from "@/components/dialog";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { getImageUrl } from "@/features/settings/utils";
import { OutputTypeEnum } from "@/features/workflows/schema/create-workflow-schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CreateProductFormDialog } from "./create-product-form-dialog";
import { CreateMaterialDialog } from "./create-material-dialog";
import { useRouter } from "next/navigation";

interface WorkflowStatusCardProps {
  request?: RequestDetail;
  onChangeTab?: (tab: string) => void;
  onConvertToProduct?: () => void;
}

interface FieldSubprocess {
  productName?: string | null;
  howToProduce?: string | null;
  SKU?: string | null;
  productCode?: string | null;
  SKUDescription?: string | null;
  category?: string | null;
  [key: string]: any;
}

export const WorkflowStatusCard: React.FC<WorkflowStatusCardProps> = ({
  request,
  onChangeTab,
  onConvertToProduct,
}) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);

  const currentStep = calculateCurrentStep(
    request?.procedureHistory?.subprocessesHistory
  );

  const completionPercentage = calculateCompletionPercentage(
    request?.procedureHistory?.subprocessesHistory
  );

  const isRequestApproved = request?.status === RequestStatus.APPROVED;
  const isRequestRejected = request?.status === RequestStatus.REJECTED;
  const isRequestHold = request?.status === RequestStatus.HOLD;

  const approvalInfo = request?.approvalInfo;

  const handleViewImages = (images: string[], title: string) => {
    setSelectedImages(images);
    setDialogTitle(title);
    setIsImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setIsImageDialogOpen(false);
    setSelectedImages([]);
    setDialogTitle("");
  };

  const outputType = request?.statusProduct?.procedure?.outputType;

  const getProductTypeText = (type?: OutputTypeEnum) => {
    switch (type) {
      case OutputTypeEnum.ACCESSORY:
        return "phụ kiện";
      case OutputTypeEnum.PRODUCT:
        return "sản phẩm";
      default:
        return "nguyên vật liệu";
    }
  };

  const getWorkflowTitle = (type?: OutputTypeEnum) => {
    switch (type) {
      case OutputTypeEnum.ACCESSORY:
        return "Quy trình phụ kiện";
      case OutputTypeEnum.PRODUCT:
        return "Quy trình sản phẩm";
      default:
        return "Quy trình nguyên vật liệu";
    }
  };

  const router = useRouter();

  const getDefaultValues = () => {
    const subprocessHistory =
      request?.procedureHistory?.subprocessesHistory || [];
    let productName = "";
    let manufacturingProcess = "";
    let sku = "";
    let productCode = "";
    let skuDescription = "";
    let categoryId: undefined | number;

    subprocessHistory.forEach((step: SubprocessHistoryType) => {
      const fieldSubprocess = (step.fieldSubprocess as FieldSubprocess) || {};

      // Check each field in fieldSubprocess
      if (fieldSubprocess.productName) {
        productName = fieldSubprocess.productName;
      }
      if (fieldSubprocess.howToProduce) {
        manufacturingProcess = fieldSubprocess.howToProduce;
      }
      if (fieldSubprocess.SKU) {
        sku = fieldSubprocess.SKU;
      }
      if (fieldSubprocess.productCode) {
        productCode = fieldSubprocess.productCode;
      }
      if (fieldSubprocess.SKUDescription) {
        skuDescription = fieldSubprocess.SKUDescription;
      }
      if (fieldSubprocess.category) {
        categoryId = fieldSubprocess.category
          ? Number(fieldSubprocess.category)
          : undefined;
      }
    });

    return {
      name: productName,
      manufacturingProcess,
      sku: sku || productCode, // Use SKU if available, fallback to productCode
      description: skuDescription || "", // Use SKUDescription if available
      categoryId: categoryId,
    };
  };

  const renderApprovedState = () => (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ</span>
          <span>{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Bước hiện tại
          </p>
          <p>{currentStep?.name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Trạng thái
          </p>
          <p>{getStatusText(currentStep?.status)}</p>
        </div>
      </div>

      {/* Production Plan Section */}
      {approvalInfo?.productionPlan && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Kế hoạch sản xuất
            </span>
          </div>
          <p className="text-sm text-green-700">
            {approvalInfo.productionPlan}
          </p>
        </div>
      )}

      {/* Files Section */}
      {approvalInfo?.files && approvalInfo.files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">
              Tài liệu đính kèm
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {approvalInfo.files.map((file, index) => (
              <a
                key={index}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100"
              >
                Tài liệu {index + 1}
              </a>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              handleViewImages(
                approvalInfo.files,
                "Tài liệu đính kèm - Phê duyệt"
              )
            }
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem hình ảnh
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (onChangeTab) {
            onChangeTab("workflow");
          }
        }}
      >
        Xem chi tiết quy trình
      </Button>

      {/* Show completion card if workflow is completed */}
      {completionPercentage === 100 && (
        <Card className="border-green-200 bg-green-50 mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              {getWorkflowTitle(outputType)} hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request?.status === RequestStatus.COMPLETED ? (
              <Button
                variant="outline"
                onClick={() => {
                  if (outputType === OutputTypeEnum.PRODUCT) {
                    router.push(`/dashboard/products`);
                  } else {
                    router.push(`/dashboard/materials`);
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Button>
            ) : (
              <>
                <p className="text-green-700">
                  Tất cả các bước trong{" "}
                  {getWorkflowTitle(outputType).toLowerCase()} đã được hoàn
                  thành thành công. Bạn có thể chuyển đổi yêu cầu này thành{" "}
                  {getProductTypeText(outputType)}.
                </p>
                <div className="flex gap-2">
                  {outputType === OutputTypeEnum.PRODUCT ? (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsCreateProductOpen(true)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Chuyển thành {getProductTypeText(outputType)}
                    </Button>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setIsCreateMaterialOpen(true);
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Chuyển thành {getProductTypeText(outputType)}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderRejectedState = () => (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          Yêu cầu bị từ chối
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-red-700">
          Yêu cầu này đã bị từ chối và không thể tiếp tục quy trình.
        </p>
        {approvalInfo?.denyReason && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Lý do từ chối
              </span>
            </div>
            <p className="text-sm text-red-700">{approvalInfo.denyReason}</p>
          </div>
        )}
        {approvalInfo?.files && approvalInfo.files.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Tài liệu đính kèm
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {approvalInfo.files.map((file, index) => (
                <a
                  key={index}
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded border border-red-200 hover:bg-red-200"
                >
                  Tài liệu {index + 1}
                </a>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                handleViewImages(
                  approvalInfo.files,
                  "Tài liệu đính kèm - Từ chối"
                )
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem hình ảnh
            </Button>
          </div>
        )}
        <p className="text-xs text-red-600">
          Ngày từ chối:{" "}
          {formatDate(approvalInfo?.createdAt, "dd/MM/yyyy HH:mm")}
        </p>
      </CardContent>
    </Card>
  );

  const renderHoldState = () => (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Yêu cầu tạm dừng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-yellow-700">
          Yêu cầu này đang tạm dừng và cần được xem xét lại trước khi tiếp tục.
        </p>
        {approvalInfo?.holdReason && (
          <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Lý do tạm dừng
              </span>
            </div>
            <p className="text-sm text-yellow-700">{approvalInfo.holdReason}</p>
          </div>
        )}
        {approvalInfo?.files && approvalInfo.files.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Tài liệu đính kèm
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {approvalInfo.files.map((file, index) => (
                <a
                  key={index}
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded border border-yellow-200 hover:bg-yellow-200"
                >
                  Tài liệu {index + 1}
                </a>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                handleViewImages(
                  approvalInfo.files,
                  "Tài liệu đính kèm - Tạm dừng"
                )
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem hình ảnh
            </Button>
          </div>
        )}
        <p className="text-xs text-yellow-600">
          Ngày tạm dừng:{" "}
          {formatDate(approvalInfo?.updatedAt, "dd/MM/yyyy HH:mm")}
        </p>
      </CardContent>
    </Card>
  );

  const renderDefaultState = () => (
    <p className="text-sm text-muted-foreground">
      Yêu cầu chưa được phê duyệt. Không có thông tin quy trình.
    </p>
  );

  const getCardTitle = () => {
    if (isRequestApproved) return "Thông tin quy trình";
    if (isRequestHold) return "Thông tin tạm dừng";
    if (isRequestRejected) return "Thông tin bị từ chối";
    return "Thông tin quy trình";
  };

  const renderContent = () => {
    if (isRequestApproved) return renderApprovedState();
    if (isRequestRejected) return renderRejectedState();
    if (isRequestHold) return renderHoldState();
    if (request?.status === RequestStatus.COMPLETED)
      return renderApprovedState();
    return renderDefaultState();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            {getCardTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{renderContent()}</CardContent>
      </Card>

      {/* Image Dialog */}
      <BaseDialog
        open={isImageDialogOpen}
        onClose={handleCloseImageDialog}
        contentClassName="max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>Hình ảnh: {dialogTitle}</DialogTitle>
        </DialogHeader>

        {selectedImages && selectedImages.length > 0 ? (
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {selectedImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-96 w-full">
                    <Image
                      src={getImageUrl(image) || "/placeholder.svg"}
                      alt={dialogTitle}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {selectedImages.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        ) : (
          <div className="text-center py-8">Không có hình ảnh</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCloseImageDialog}>
            Đóng
          </Button>
        </DialogFooter>
      </BaseDialog>

      <CreateProductFormDialog
        open={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        defaultValues={getDefaultValues()}
      />

      <CreateMaterialDialog
        request={request}
        open={isCreateMaterialOpen}
        onClose={() => setIsCreateMaterialOpen(false)}
      />
    </>
  );
};
