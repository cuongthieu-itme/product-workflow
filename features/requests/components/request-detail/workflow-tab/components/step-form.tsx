import { InputCustom } from "@/components/form/input";
import {
  SubprocessHistoryType,
  StatusSubprocessHistory,
} from "@/features/requests/type";
import { useGetUserInfoQuery } from "@/features/auth/hooks/useGetUserInfoQuery";
import { Loader2, User, Pause, CheckCircle, Play } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import { UserRoleEnum } from "@/features/auth/constants";
import { useUsersQuery } from "@/features/users/hooks";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useProductsStatusQuery } from "@/features/products-status/hooks";
import { useMaterialsQuery } from "@/features/materials/hooks";
import { Button } from "@/components/ui/button";
import {
  useSkipSubprocessHistoryMutation,
  useUpdateSubprocessHistoryMutation,
  useUpdateFieldStepMutation,
  useApproveSubprocessHistoryMutation,
  useAssignUserToStepMutation,
  useContinueSubprocessMutation,
} from "@/features/requests/hooks/useRequest";
import { useToast } from "@/components/ui/use-toast";

interface StepEditFormProps {
  step: SubprocessHistoryType;
  steps: SubprocessHistoryType[];
  currentUser: any;
  request?: {
    source: string;
    priority: string;
    customerId: number;
    statusProductId: number;
  };
}

import {
  BadgeCheck,
  CircleSlash,
  Clock,
  CalendarDays,
  Coins,
  Settings,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { getCheckFields, getHoldInfo } from "@/features/requests/helpers";
import { format } from "date-fns";
import { useGetFieldStep } from "@/features/workflows/hooks/useWorkFlowProcess";
import { FieldType } from "@/features/workflows/types";
import { Fields } from "./fields";
import { StepInfo } from "./step-infor";
import { AdminUserAssignment } from "./admin-user-assignment";
import { HoldSubprocessDialog } from "./hold-subprocess-dialog";
import { MaterialRequestModal } from "./material-request-modal";
import { useGetRequestDetailQuery } from "@/features/requests/hooks";

export const StepEditForm: React.FC<StepEditFormProps> = ({
  step,
  steps,
  currentUser,
  request,
}) => {
  const user = step.user;
  const userName = user?.fullName || "Chưa có";
  const userAvatar = user?.avatarUrl || undefined;

  const { data: fields } = useGetFieldStep();

  // Fetch data for select field mapping
  const { data: users } = useUsersQuery({ limit: 10000 });
  const { data: categories } = useCategoriesQuery({ limit: 10000 });
  const { data: productStatus } = useProductsStatusQuery({ limit: 10000 });
  const { data: materials } = useMaterialsQuery({ page: 1, limit: 10000 });

  const checkFieldsList = getCheckFields(step);

  // State để theo dõi validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Helper function to get options based on field enumValue (copied from fields.tsx)
  const getOptionsForField = (field: FieldType) => {
    // If field has enumValue, try to parse it first
    if (field.enumValue) {
      try {
        const parsedOptions = JSON.parse(field.enumValue);
        if (Array.isArray(parsedOptions)) {
          return parsedOptions;
        }
      } catch (e) {
        // If not JSON, try to split by comma
        const splitOptions = field.enumValue.split(",").map((opt) => ({
          label: opt.trim(),
          value: opt.trim(),
        }));
        if (splitOptions.length > 1) {
          return splitOptions;
        }
      }
    }

    // Map based on enumValue constants
    switch (field.enumValue) {
      // User-related fields
      case "APPROVED_BY":
      case "PURCHASER":
      case "CHECKED_BY":
      case "DESIGNER":
      case "SAMPLE_MAKER":
      case "PRODUCT_FEEDBACK_RESPONDER":
      case "SAMPLE_FEEDBACK_RESPONDER":
      case "MATERIAL_CONFIRMER":
      case "WAREHOUSE_CHECKER":
      case "RD_MATERIAL_CHECKER":
      case "ASSIGNED_TO":
      case "TEMPLATE_CHECKER":
      case "MOCKUP_CHECKER":
      case "APPROVED_BY":
      case "DESIGNER":
        return (
          users?.data?.map((user) => ({
            label: user.fullName,
            value: user.id,
          })) || []
        );

      // Status fields
      case "STATUS":
      case "SAMPLE_STATUS":
      case "PRODUCT_FEEDBACK_STATUS":
      case "PURCHASE_STATUS":
      case "TEMPLATE_CHECKING_STATUS":
      case "MOCKUP_CHECKING_STATUS":
        return (
          productStatus?.data?.map((status) => ({
            label: status.name,
            value: status.id,
          })) || []
        );

      // Material type field
      case "MATERIAL_TYPE":
        return (
          materials?.data?.map((material) => ({
            label: material.name,
            value: material.id,
          })) || []
        );

      // Category field
      case "CATEGORY":
        return (
          categories?.data?.map((category) => ({
            label: category.name,
            value: category.id,
          })) || []
        );

      // Default status options for common status fields
      default:
        if (field.value?.toLowerCase().includes("status")) {
          return [
            { label: "Chờ xử lý", value: "pending" },
            { label: "Đang xử lý", value: "processing" },
            { label: "Hoàn thành", value: "completed" },
            { label: "Đã hủy", value: "cancelled" },
          ];
        }
        return [];
    }
  };

  // Function để kiểm tra field có nên hiển thị không dựa vào checkFields
  const shouldShowField = (field: FieldType): boolean => {
    // Nếu không có fields data, return false
    if (!fields?.data) return false;

    // Nếu không có checkFields list, hiển thị tất cả
    if (checkFieldsList.length === 0) return false;

    // Kiểm tra enumValue của field có trong checkFields list không
    const isIncluded = checkFieldsList.includes(field.enumValue);

    return isIncluded;
  };

  // Function để validate các field bắt buộc
  const validateRequiredFields = (formData: any): string[] => {
    const errors: string[] = [];
    
    if (!fields?.data) return errors;

    // Kiểm tra tất cả các field hiển thị đều phải có dữ liệu để hoàn thành
    fields.data.forEach((field) => {
      if (shouldShowField(field)) {
        const fieldValue = formData[field.value];
        
        // Kiểm tra field có giá trị hay không
        if (!fieldValue || 
            (Array.isArray(fieldValue) && fieldValue.filter(Boolean).length === 0) ||
            (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
            (fieldValue === null || fieldValue === undefined)) {
          errors.push(`${field.label} là bắt buộc`);
        }
      }
    });

    return errors;
  };

  // Tạo dynamic schema dựa trên fields - simplified approach
  const { data: currentUserData } = useGetUserInfoQuery();

  const isAdmin =
    currentUserData?.role === UserRoleEnum.ADMIN ||
    currentUserData?.role === UserRoleEnum.SUPER_ADMIN;
  const isAssignedUser = currentUserData?.id === step.userId;
  const canEdit = (isAdmin || isAssignedUser) && !step?.isApproved;
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      ...step,
      id: step.id,
      startDate: step.startDate ? new Date(step.startDate) : new Date(),
      endDate: step.endDate ? new Date(step.endDate) : new Date(),
      userId: step.userId || undefined,
      price: step.price ?? undefined,
      isStepWithCost: step.isStepWithCost,
      // Thêm current values từ fieldSubprocess nếu có
      ...(step.fieldSubprocess
        ? {
            status: step.fieldSubprocess.status || "",
            materialType: step.fieldSubprocess.materialType || "",
            media: step.fieldSubprocess.media || [],
            purchaseLink: step.fieldSubprocess.purchaseLink || [],
            additionalNote: step.fieldSubprocess.additionalNote || "",
            approvedBy: step.fieldSubprocess.approvedBy || "",
            approvedTime: step.fieldSubprocess.approvedTime
              ? new Date(step.fieldSubprocess.approvedTime)
              : null,
            purchaser: step.fieldSubprocess.purchaser || "",
            purchasingTime: step.fieldSubprocess.purchasingTime
              ? new Date(step.fieldSubprocess.purchasingTime)
              : null,
            trackingLink: step.fieldSubprocess.trackingLink || "",
            receivedQuantity: step.fieldSubprocess.receivedQuantity || 0,
            checkedBy: step.fieldSubprocess.checkedBy || "",
            checkedTime: step.fieldSubprocess.checkedTime
              ? new Date(step.fieldSubprocess.checkedTime)
              : null,
            sampleProductionPlan:
              step.fieldSubprocess.sampleProductionPlan || "",
            designer: step.fieldSubprocess.designer || "",
            startTime: step.fieldSubprocess.startTime
              ? new Date(step.fieldSubprocess.startTime)
              : null,
            completedTime: step.fieldSubprocess.completedTime
              ? new Date(step.fieldSubprocess.completedTime)
              : null,
            productionFileLink: step.fieldSubprocess.productionFileLink || "",
            sampleMaker: step.fieldSubprocess.sampleMaker || "",
            sampleStatus: step.fieldSubprocess.sampleStatus || "",
            sampleMediaLink: step.fieldSubprocess.sampleMediaLink || [],
            // Map the first three media items into 3 single-file upload controls
            sampleMediaLink_1:
              step.fieldSubprocess.sampleMediaLink?.[0]
                ? [step.fieldSubprocess.sampleMediaLink[0]]
                : [],
            sampleMediaLink_2:
              step.fieldSubprocess.sampleMediaLink?.[1]
                ? [step.fieldSubprocess.sampleMediaLink[1]]
                : [],
            sampleMediaLink_3:
              step.fieldSubprocess.sampleMediaLink?.[2]
                ? [step.fieldSubprocess.sampleMediaLink[2]]
                : [],
            note: step.fieldSubprocess.note || "",
            finalApprovedSampleImage:
              step.fieldSubprocess.finalApprovedSampleImage || "",
            // Array form for upload control of FINAL_APPROVED_SAMPLE_IMAGE
            finalApprovedSampleImageArray:
              step.fieldSubprocess.finalApprovedSampleImage
                ? [step.fieldSubprocess.finalApprovedSampleImage]
                : [],
            finalProductVideo: step.fieldSubprocess.finalProductVideo || "",
            // ... có thể thêm các fields khác nếu cần
          }
        : {}),
      // Thêm default values cho dynamic fields nếu có
      ...(fields?.data?.reduce((acc, field) => {
        if (shouldShowField(field)) {
          // Chỉ set default nếu chưa có value từ fieldSubprocess
          if (!(field.value in (step.fieldSubprocess || {}))) {
            switch (field.type.toLowerCase()) {
              case "number":
                acc[field.value] = 0;
                break;
              case "date":
                acc[field.value] = new Date();
                break;
              case "file":
                // Không set default value cho file input
                break;
              case "string_array":
                // Khởi tạo array với một string rỗng (bắt buộc)
                acc[field.value] = [""];
                break;
              default:
                // Kiểm tra nếu field type chứa "array"
                if (field.type.toLowerCase().includes("array")) {
                  acc[field.value] = [""];
                } else {
                  acc[field.value] = "";
                }
                break;
            }
          }
        }
        return acc;
      }, {} as Record<string, any>) || {}),
    },

    mode: "onChange",
  });

  const isStepWithCost = step.isStepWithCost;

  // Load request detail to get approvalInfo for defaulting SAMPLE_PRODUCTION_PLAN at step 1
  const { data: requestDetail } = useGetRequestDetailQuery();

  useEffect(() => {
    if (
      step?.step === 1 &&
      !getValues("sampleProductionPlan") &&
      requestDetail?.approvalInfo?.productionPlan
    ) {
      setValue(
        "sampleProductionPlan",
        requestDetail.approvalInfo.productionPlan,
        { shouldDirty: true, shouldValidate: false }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.step, requestDetail?.approvalInfo?.productionPlan]);

  // Compute nearest previous SAMPLE_MEDIA_LINK for current step
  const nearestSampleMedia = useMemo(() => {
    if (!Array.isArray(steps) || !step) return [] as string[];
    const currentIndex = steps.findIndex((s: SubprocessHistoryType) => s.id === step.id);
    for (let i = currentIndex - 1; i >= 0; i--) {
      const media = steps[i]?.fieldSubprocess?.sampleMediaLink;
      if (Array.isArray(media) && media.length > 0) {
        return media;
      }
    }
    return [] as string[];
  }, [steps, step]);

  // Compute nearest previous FINAL_APPROVED_SAMPLE_IMAGE for current step
  const nearestApprovedSampleImage = useMemo(() => {
    if (!Array.isArray(steps) || !step) return "";
    const currentIndex = steps.findIndex((s: SubprocessHistoryType) => s.id === step.id);
    for (let i = currentIndex - 1; i >= 0; i--) {
      const img = steps[i]?.fieldSubprocess?.finalApprovedSampleImage;
      if (img && typeof img === "string" && img.trim().length > 0) {
        return img;
      }
    }
    return "";
  }, [steps, step]);

  // Compute nearest previous SAMPLE_PRODUCTION_PLAN
  const nearestSampleProductionPlan = useMemo(() => {
    if (!Array.isArray(steps) || !step) return "";
    const currentIndex = steps.findIndex((s: SubprocessHistoryType) => s.id === step.id);
    for (let i = currentIndex - 1; i >= 0; i--) {
      const plan = steps[i]?.fieldSubprocess?.sampleProductionPlan;
      if (plan && typeof plan === "string" && plan.trim().length > 0) {
        return plan;
      }
    }
    return "";
  }, [steps, step]);

  // Default sampleProductionPlan: prefer nearest previous; step 1 fallback from request.fieldSubprocess.sampleProductionPlan (then approvalInfo.productionPlan)
  useEffect(() => {
    const current = getValues("sampleProductionPlan") as string | undefined;
    if (current && current.trim().length > 0) return;

    if (nearestSampleProductionPlan) {
      setValue("sampleProductionPlan", nearestSampleProductionPlan, {
        shouldDirty: true,
        shouldValidate: false,
      });
      return;
    }

    // Step 1: prefer request.fieldSubprocess.sampleProductionPlan, then approvalInfo.productionPlan
    if (step?.step === 1) {
      const fallbackFromRequest =
        requestDetail?.fieldSubprocess?.sampleProductionPlan ||
        requestDetail?.approvalInfo?.productionPlan ||
        "";
      if (fallbackFromRequest) {
        setValue("sampleProductionPlan", fallbackFromRequest, {
          shouldDirty: true,
          shouldValidate: false,
        });
        return;
      }
    }

    // Other steps: fallback to approvalInfo.productionPlan
    if (requestDetail?.approvalInfo?.productionPlan) {
      setValue("sampleProductionPlan", requestDetail.approvalInfo.productionPlan, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearestSampleProductionPlan, step?.step, requestDetail?.fieldSubprocess?.sampleProductionPlan, requestDetail?.approvalInfo?.productionPlan]);

  const { mutate: updateSubprocessHistory } =
    useUpdateSubprocessHistoryMutation();

  const { mutate: skipSubprocessHistory } = useSkipSubprocessHistoryMutation();
  const { mutate: assignUserToStep } = useAssignUserToStepMutation();
  const { mutate: updateFieldStep } = useUpdateFieldStepMutation();
  const { mutate: approveSubprocessHistory } =
    useApproveSubprocessHistoryMutation();
  const { mutate: continueSubprocess } = useContinueSubprocessMutation();

  // Get hold information
  const holdInfo = getHoldInfo(step);

  const handleSkipStep = () => {
    if (!step.id || step.isRequired) return;
    skipSubprocessHistory(
      {
        id: step.id,
        status: StatusSubprocessHistory.SKIPPED,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Bước này đã được bỏ qua!",
          });
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Không thể bỏ qua bước này!",
            variant: "destructive",
          });
        },
      }
    );
  };
  const [completeMode, setCompleteMode] = useState(false);
  const [approveMode, setApproveMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    step.userId || undefined
  );
  const [materialRequestModalOpen, setMaterialRequestModalOpen] =
    useState(false);

  // Update selectedUserId when step changes
  useEffect(() => {
    setSelectedUserId(step.userId || undefined);
  }, [step.userId]);

  const hasStartTime = step?.startDate;

  const onSubmit: SubmitHandler<any> = (data) => {
    // Normalize special fields (e.g., SAMPLE_MEDIA_LINK combines 3 upload boxes)
    const normalizedData: any = { ...data };
    fields?.data?.forEach((field) => {
      if (shouldShowField(field) && field.enumValue === "SAMPLE_MEDIA_LINK") {
        const part1 = (data?.[`${field.value}_1`] as string[]) || [];
        const part2 = (data?.[`${field.value}_2`] as string[]) || [];
        const part3 = (data?.[`${field.value}_3`] as string[]) || [];
        normalizedData[field.value] = [...part1, ...part2, ...part3].filter(
          Boolean
        );
      }
      if (
        shouldShowField(field) &&
        field.enumValue === "FINAL_APPROVED_SAMPLE_IMAGE"
      ) {
        const arr = (data?.[`${field.value}Array`] as string[]) || [];
        normalizedData[field.value] = arr[0] || "";
      }
    });

    // Nếu đang ở chế độ hoàn thành, validate các field bắt buộc
    if (completeMode) {
      const errors = validateRequiredFields(normalizedData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationErrors(true);
        toast({
          title: "Lỗi validation",
          description: "Vui lòng điền đầy đủ các trường bắt buộc trước khi hoàn thành",
          variant: "destructive",
        });
        return;
      }
    }

    // Reset validation errors nếu validation thành công
    setValidationErrors([]);
    setShowValidationErrors(false);

    const status = completeMode
      ? StatusSubprocessHistory.COMPLETED
      : StatusSubprocessHistory.IN_PROGRESS;

    // Lọc chỉ lấy các field cần thiết cho API
    const submitData = {
      id: step.id,
      startDate: normalizedData.startDate,
      endDate: new Date(), // Luôn cập nhật endDate khi submit
      userId: normalizedData.userId,
      price: normalizedData.price,
      isStepWithCost: normalizedData.isStepWithCost,
      status: status,
    };

    const fieldsSub = // Thêm fieldSubprocess data nếu có
      fields?.data
        ? Object.keys(normalizedData).reduce((acc, key) => {
            // Chỉ include các field từ fields.data (dynamic fields)
            if (fields.data.some((field) => field.value === key)) {
              acc[key] = normalizedData[key];
            }
            return acc;
          }, {} as Record<string, any>)
        : undefined;

    // Kiểm tra nếu có thay đổi về selectedUserId (chỉ admin mới được phép)
    const shouldAssignUser =
      isAdmin && selectedUserId && selectedUserId !== step.userId;

    // Function để update subprocess history
    const updateSubprocess = () => {
      // Luôn kiểm tra và cập nhật fieldSubprocess nếu có dữ liệu
      if (
        fieldsSub &&
        Object.keys(fieldsSub).length > 0 &&
        step.fieldSubprocess?.id
      ) {
        updateFieldStep(
          {
            id: step.fieldSubprocess.id,
            ...fieldsSub,
          },
          {
            onSuccess: () => {
              // Sau khi update field step thành công, update subprocess history
              updateSubprocessHistory(submitData, {
                onSuccess: () => {
                  toast({
                    title: "Thành công",
                    description: completeMode
                      ? "Bước đã hoàn thành và dữ liệu đã được lưu"
                      : "Dữ liệu đã được lưu thành công",
                  });
                },
                onError: () => {
                  toast({
                    title: "Thất bại",
                    description: "Có lỗi xảy ra khi cập nhật trạng thái bước",
                    variant: "destructive",
                  });
                },
              });
            },
            onError: () => {
              toast({
                title: "Thất bại",
                description: "Có lỗi xảy ra khi lưu dữ liệu bước",
                variant: "destructive",
              });
            },
          }
        );
      } else {
        // Nếu không có dynamic fields, chỉ update subprocess history
        updateSubprocessHistory(submitData, {
          onSuccess: () => {
            toast({
              title: "Thành công",
              description: completeMode
                ? "Bước đã hoàn thành"
                : "Bước đã được cập nhật thành công",
            });
          },
          onError: () => {
            toast({
              title: "Thất bại",
              description: "Có lỗi xảy ra khi cập nhật bước",
              variant: "destructive",
            });
          },
        });
      }
    };

    // Nếu cần assign user trước, thực hiện assign user trước
    if (shouldAssignUser) {
      assignUserToStep(
        {
          id: step.id,
          userId: selectedUserId,
          isRequired: step.isRequired,
          isStepWithCost: step.isStepWithCost,
        },
        {
          onSuccess: () => {
            toast({
              title: "Thành công",
              description: "Đã gán người thực hiện cho bước này!",
            });
            // Sau khi assign user thành công, tiếp tục update subprocess
            updateSubprocess();
          },
          onError: () => {
            toast({
              title: "Thất bại",
              description: "Có lỗi xảy ra khi gán người thực hiện",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Nếu không cần assign user, chỉ update subprocess
      updateSubprocess();
    }

    setCompleteMode(false); // reset lại sau submit
    setApproveMode(false); // reset lại sau submit
  };

  // Handle start time button click
  const handleStartTime = () => {
    if (!step.userId) {
      toast({
        title: "Lỗi",
        description: "Chưa có người thực hiện được gán cho bước này!",
        variant: "destructive",
      });
      return;
    }

    const currentTime = new Date();
    const currentFormData = watch();

    // Chuẩn bị data cho updateSubprocessHistory
    const submitData = {
      id: step.id,
      startDate: currentTime,
      endDate: null,
      userId: step.userId,
      price: currentFormData.price,
      isStepWithCost: currentFormData.isStepWithCost,
      status: StatusSubprocessHistory.IN_PROGRESS,
    };

    updateSubprocessHistory(submitData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã bắt đầu công việc!",
        });
      },
      onError: () => {
        toast({
          title: "Thất bại",
          description: "Có lỗi xảy ra khi cập nhật trạng thái bước",
          variant: "destructive",
        });
      },
    });
  };

  // Handle continue subprocess
  const handleContinueSubprocess = () => {
    continueSubprocess(
      { id: step.id },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Đã tiếp tục subprocess!",
          });
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Không thể tiếp tục subprocess!",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Handle approve step
  const handleApproveStep = () => {
    if (!step.id) return;

    approveSubprocessHistory(
      {
        id: step.id,
        isApproved: true,
      },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: "Bước đã được phê duyệt!",
          });
          setApproveMode(false);
        },
        onError: () => {
          toast({
            title: "Thất bại",
            description: "Có lỗi xảy ra khi phê duyệt bước",
            variant: "destructive",
        });
          setApproveMode(false);
        },
      }
    );
  };

  // Check if this is step 1
  const isStep1 = step.step === 1;

  if (!canEdit) {
    return (
      <div key={step.id} className="overflow-visible">
        <StepInfo
          step={step}
          userName={userName}
          userAvatar={userAvatar}
          fields={fields}
          shouldShowField={shouldShowField}
        />
      </div>
    );
  }

  return (
    <>
      <form
        key={step.id}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 mt-2 overflow-visible"
        noValidate
      >
        {/* Validation Errors Display */}
        {showValidationErrors && validationErrors.length > 0 && (
          <div className="p-4 rounded-md border border-red-200 bg-red-50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-red-600 w-5 h-5" />
              <h3 className="text-lg font-medium text-red-800">
                Vui lòng điền đầy đủ các trường bắt buộc
              </h3>
            </div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowValidationErrors(false)}
              className="mt-3 text-red-600 border-red-300 hover:bg-red-100"
            >
              Đóng
            </Button>
          </div>
        )}

        <div className="p-4 rounded-md border bg-card shadow-sm">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
            <CalendarDays className="text-primary w-5 h-5" />
            Thông tin bước thực hiện
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Thời gian thực hiện
              </h4>

              <div className="p-4 rounded-md border bg-muted space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-blue-600 w-5 h-5" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Ngày bắt đầu:
                    </span>{" "}
                    <span className="text-sm">
                      {step.startDate
                        ? format(new Date(step.startDate), "dd/MM/yyyy hh:mm")
                        : "Chưa xác định"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-blue-600 w-5 h-5" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Ngày kết thúc:
                    </span>{" "}
                    <span className="text-sm">
                      {step.endDate
                        ? format(new Date(step.endDate), "dd/MM/yyyy hh:mm")
                        : "Chưa xác định"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Người thực hiện
              </h4>

              {/* Current User Display */}
              <div className="p-4 rounded-md border bg-muted">
                <div className="flex items-center gap-2">
                  <User className="text-blue-600 w-5 h-5" />
                  <div>
                    <span className="text-sm">
                      {user?.fullName || "Chưa có người thực hiện"}
                      {user?.email && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({user.email})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Section - Only if applicable */}
            {isStepWithCost && (
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Thông tin chi phí
                </h4>
                {isAssignedUser ? (
                  <InputCustom
                    name="price"
                    control={control}
                    label="Chi phí thực hiện"
                    type="number"
                    min={1}
                    step={1000}
                    placeholder="Nhập chi phí"
                    className="w-full"
                    labelIcon={<Coins className="text-yellow-600 w-4 h-4" />}
                  />
                ) : (
                  <div className="p-4 rounded-md border bg-muted">
                    <div className="flex items-center gap-2">
                      <Coins className="text-yellow-600 w-5 h-5" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Chi phí:
                      </span>{" "}
                      <span className="text-sm">
                        {step.price
                          ? `${step.price.toLocaleString()} đ`
                          : "Chưa có"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admin User Assignment Section - Only visible to admin */}
        {isAdmin && (
          <AdminUserAssignment
            step={step}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Completed Fields Display Section - Show completed field values */}
        {(step.isApproved ||
          step.status === StatusSubprocessHistory.COMPLETED) &&
          step.fieldSubprocess &&
          Object.keys(step.fieldSubprocess).length > 0 && (
            <div className="p-4 rounded-md border bg-green-50 shadow-sm">
              <h3 className="text-lg font-medium mb-4 pb-2 border-b border-green-200 flex items-center gap-2">
                <BadgeCheck className="text-green-600 w-5 h-5" />
                Thông tin bổ sung đã hoàn thành
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields?.data
                  ?.filter(
                    (field) =>
                      shouldShowField(field) &&
                      (step.fieldSubprocess as any)?.[field.value as string]
                  )
                  .map((field) => {
                    const fieldValue = (step.fieldSubprocess as any)?.[
                      field.value as string
                    ];

                    // Helper function to get display value for select fields
                    const getDisplayValue = (
                      field: FieldType,
                      value: any
                    ): string => {
                      if (!value && value !== 0) return "Chưa có dữ liệu";

                      // Handle select/enum fields
                      if (
                        field.type.toLowerCase() === "select" ||
                        field.type.toLowerCase() === "enum"
                      ) {
                        // Try to get the actual label from the options
                        const options = getOptionsForField(field);
                        const selectedOption = options.find(
                          (opt) => opt.value == value
                        );
                        return selectedOption
                          ? selectedOption.label
                          : value.toString();
                      }

                      // Handle date fields
                      if (field.type.toLowerCase() === "date") {
                        try {
                          return new Date(value).toLocaleDateString("vi-VN");
                        } catch {
                          return value.toString();
                        }
                      }

                      return value.toString();
                    };

                    return (
                      <div
                        key={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <span className="text-sm font-medium text-green-800">
                          {field.label}
                        </span>
                        <div className="text-sm text-green-700 bg-white p-3 rounded-md border border-green-200">
                          {field.valueType === "string_array" &&
                          Array.isArray(fieldValue) ? (
                            fieldValue.filter(Boolean).length > 0 ? (
                              <ul className="space-y-1">
                                {fieldValue
                                  .filter(Boolean)
                                  .map((item: string, index: number) => (
                                    <li key={index} className="text-sm">
                                      • {item}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <span className="text-gray-500 italic">
                                Chưa có dữ liệu
                              </span>
                            )
                          ) : (
                            <span>{getDisplayValue(field, fieldValue)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        {/* Dynamic Fields Section - Only show when step is not completed or user can edit */}
        {fields?.data &&
          fields.data.length > 0 &&
          !step.isApproved &&
          step.status !== StatusSubprocessHistory.COMPLETED && (
            <div className="p-4 rounded-md border bg-card shadow-sm overflow-visible">
              <h3 className="text-lg font-medium mb-4 pb-2 border-b flex items-center gap-2">
                <Settings className="text-primary w-5 h-5" />
                Thông tin bổ sung
                {fields?.data?.filter((field) => shouldShowField(field)).length > 0 && (
                  <span className="text-sm text-red-600 font-normal">
                    (* Tất cả các trường đều bắt buộc để hoàn thành)
                  </span>
                )}
              </h3>

              <Fields
                fields={fields}
                control={control}
                shouldShowField={shouldShowField}
                isCompleted={step.isApproved}
                values={step.fieldSubprocess || {}}
                nearestSampleMedia={nearestSampleMedia}
                nearestApprovedSampleImage={nearestApprovedSampleImage}
              />

              {/* Show message if no fields to display */}
              {fields?.data &&
                fields.data.filter((field) => shouldShowField(field)).length ===
                  0 && (
                  <div className="text-center text-gray-500 py-4">
                    Không có trường nào để hiển thị
                  </div>
                )}
            </div>
          )}

        <div className="mt-6 border-t pt-4 flex justify-between items-center">
          <div className="space-x-2">
            {!step.isRequired && (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSkipStep}
                variant="outline"
                className="border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                {isSubmitting && !completeMode ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CircleSlash className="w-4 h-4 mr-2 text-red-500" />
                )}
                Bỏ qua
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {/* Button Start Time - chỉ hiển thị nếu chưa có startTime */}
            {!hasStartTime && (isAdmin || isAssignedUser) && (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleStartTime}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Bắt đầu
              </Button>
            )}

            {/* Button Yêu cầu mua nguyên vật liệu - chỉ hiển thị ở step 1 */}
            {(isAdmin || isAssignedUser) && step.isShowRequestMaterial && (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => setMaterialRequestModalOpen(true)}
                variant="outline"
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Yêu cầu mua NVL
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                setCompleteMode(false);
              }}
              variant="outline"
              className="flex items-center"
            >
              {isSubmitting && !completeMode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              Lưu thông tin
            </Button>
            {/* Button Hold - Hiển thị khi có thể hold */}
            {(isAdmin || isAssignedUser || hasStartTime) &&
              holdInfo.canHold && (
                <HoldSubprocessDialog
                  subprocessId={step.id}
                  disabled={isSubmitting}
                >
                  <Button
                    disabled={isSubmitting}
                    variant="secondary"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    {holdInfo.nextAction === "hold1" && "Tạm dừng (1/3)"}
                    {holdInfo.nextAction === "hold2" && "Tạm dừng (2/3)"}
                    {holdInfo.nextAction === "hold3" && "Tạm dừng (3/3)"}
                  </Button>
                </HoldSubprocessDialog>
              )}
            {/* Button Continue - Hiển thị khi có thể continue */}
            {(isAdmin || isAssignedUser) && holdInfo.canContinue && (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleContinueSubprocess}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                {holdInfo.nextAction === "continue1" && "Tiếp tục 1"}
                {holdInfo.nextAction === "continue2" && "Tiếp tục 2"}
                {holdInfo.nextAction === "continue3" && "Tiếp tục 3"}
              </Button>
            )}

            {/* Button Hoàn thành - Ẩn khi đang hold */}
            {(isAdmin || isAssignedUser) && !holdInfo.isCurrentlyOnHold && (
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  setCompleteMode(true);
                  // Reset validation errors khi click hoàn thành
                  setValidationErrors([]);
                  setShowValidationErrors(false);
                }}
                variant="default"
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                {isSubmitting && completeMode ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Hoàn thành
              </Button>
            )}
            {isAdmin &&
              step.status === StatusSubprocessHistory.COMPLETED &&
              !step.isApproved && (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setApproveMode(true);
                    handleApproveStep();
                  }}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  {isSubmitting && approveMode ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BadgeCheck className="w-4 h-4 mr-2" />
                  )}
                  Phê duyệt
                </Button>
              )}
          </div>
        </div>

        {/* Material Request Modal */}
      </form>
      <MaterialRequestModal
        open={materialRequestModalOpen}
        onClose={() => setMaterialRequestModalOpen(false)}
        currentRequest={request}
        currentUser={currentUser}
      />
    </>
  );
};
