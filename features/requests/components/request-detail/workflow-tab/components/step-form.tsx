import { InputCustom } from "@/components/form/input";
import {
  SubprocessHistoryType,
  StatusSubprocessHistory,
  RequestDetail,
} from "@/features/requests/type";
import { useGetUserInfoQuery } from "@/features/auth/hooks/useGetUserInfoQuery";
import { Loader2, User, Pause, CheckCircle, Play } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useEffect, useMemo, useCallback } from "react";
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
  request?: RequestDetail;
}

import {
  BadgeCheck,
  Clock,
  CalendarDays,
  Coins,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { getCheckFields, getHoldInfo } from "@/features/requests/helpers";
import { format } from "date-fns";
import { useGetFieldStep } from "@/features/workflows/hooks/useWorkFlowProcess";
import { FieldType } from "@/features/workflows/types";
import { StepInfo } from "./step-infor";
import { HoldSubprocessDialog } from "./hold-subprocess-dialog";
import { MaterialRequestModal } from "./material-request-modal";
import { useGetRequestDetailQuery } from "@/features/requests/hooks";
import { CompletedFieldsDisplay } from "./completed-fields-display";
import { DynamicFieldsSection } from "./dynamic-fields-section";

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

  // Tối ưu hóa previousStepValues để tránh re-calculation không cần thiết
  const previousStepValues = useMemo(() => {
    // Lọc ra các bước trước step hiện tại (bao gồm tất cả step trước đó)
    const previousSteps = steps
      .filter(
        (s) => s.step < step.step || (s.step === step.step && s.id < step.id)
      )
      .sort((a, b) => b.step - a.step || b.id - a.id); // Sắp xếp theo step giảm dần, sau đó theo ID giảm dần

    // Khởi tạo object để lưu giá trị
    const result: Record<string, any> = {};

    // Lặp qua các bước trước để lấy giá trị
    for (const prevStep of previousSteps) {
      if (prevStep.fieldSubprocess) {
        Object.entries(prevStep.fieldSubprocess).forEach(([key, value]) => {
          // Chỉ lưu giá trị nếu trường đó chưa có trong result (ưu tiên step gần nhất)
          if (
            !(key in result) &&
            value !== null &&
            value !== undefined &&
            value !== ""
          ) {
            result[key] = value;
          }
        });
      }
    }

    return result;
  }, [step.step, step.id, steps]);

  // Fetch data for select field mapping
  const { data: users } = useUsersQuery({ limit: 10000 });
  const { data: categories } = useCategoriesQuery({ limit: 10000 });
  const { data: productStatus } = useProductsStatusQuery({ limit: 10000 });
  const { data: materials } = useMaterialsQuery({ page: 1, limit: 10000 });

  // Tối ưu hóa checkFieldsList
  const checkFieldsList = useMemo(
    () => getCheckFields(step),
    [step.fieldSubprocess?.checkFields]
  );

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

      // Sent to RD confirmation (yes/no)
      case "MATERIAL_SENT_TO_RD":
        return [
          { label: "Có", value: "yes" },
          { label: "Không", value: "no" },
        ];

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

  // Function để kiểm tra field có nên hiển thị không dựa vào checkFields - tối ưu hóa với useCallback
  const shouldShowField = useCallback(
    (field: FieldType): boolean => {
      // Nếu không có fields data, return false
      if (!fields?.data) return false;

      // Nếu không có checkFields list, hiển thị tất cả
      if (checkFieldsList.length === 0) return false;

      // Kiểm tra enumValue của field có trong checkFields list không
      const isIncluded = checkFieldsList.includes(field.enumValue);

      return isIncluded;
    },
    [fields?.data, checkFieldsList]
  );

  // Function để validate các field bắt buộc - tối ưu hóa với useCallback
  const validateRequiredFields = useCallback(
    (formData: any): string[] => {
      const errors: string[] = [];

      if (!fields?.data) return errors;

      // Kiểm tra tất cả các field hiển thị đều phải có dữ liệu để hoàn thành
      fields.data.forEach((field) => {
        if (shouldShowField(field)) {
          const fieldValue = formData[field.value];

          // Kiểm tra field có giá trị hay không
          if (
            !fieldValue ||
            (Array.isArray(fieldValue) &&
              fieldValue.filter(Boolean).length === 0) ||
            (typeof fieldValue === "string" && fieldValue.trim() === "") ||
            fieldValue === null ||
            fieldValue === undefined
          ) {
            errors.push(`${field.label} là bắt buộc`);
          }
        }
      });

      return errors;
    },
    [fields?.data, shouldShowField]
  );

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

      // Thêm current values từ fieldSubprocess nếu có, ưu tiên previousStepValues
      ...(step.fieldSubprocess
        ? Object.keys(step.fieldSubprocess).reduce((acc, key) => {
            // Kiểm tra xem field có phải là file input không
            const field = fields?.data?.find((f) => f.value === key);
            if (field?.type?.toLowerCase() === "file") {
              // Bỏ qua việc set giá trị cho file input
              return acc;
            }
            // Đối với sampleProductionPlan, ưu tiên lấy từ previousStepValues trước
            if (key === "sampleProductionPlan") {
              acc[key] =
                previousStepValues[key] ?? request?.approvalInfo.productionPlan;
            } else {
              // Set giá trị cho các trường không phải file
              acc[key] =
                step.fieldSubprocess?.[
                  key as keyof typeof step.fieldSubprocess
                ];
            }
            return acc;
          }, {} as Record<string, any>)
        : {}),
      // Thêm values từ previousStepValues nếu không có trong fieldSubprocess
      ...Object.keys(previousStepValues).reduce((acc, key) => {
        // Chỉ set nếu chưa có trong fieldSubprocess
        if (!(key in (step.fieldSubprocess || {}))) {
          acc[key] = previousStepValues[key];
        }
        return acc;
      }, {} as Record<string, any>),
      // Thêm default values cho dynamic fields nếu có
      ...(fields?.data?.reduce((acc, field) => {
        if (shouldShowField(field)) {
          // Chỉ set default nếu chưa có value từ fieldSubprocess hoặc previousStepValues
          if (
            !(field.value in (step.fieldSubprocess || {})) &&
            !(field.value in previousStepValues)
          ) {
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

  // Compute nearest previous SAMPLE_MEDIA_LINK for current step
  const nearestSampleMedia = useMemo(() => {
    if (!Array.isArray(steps) || !step?.id) return [] as string[];
    const currentIndex = steps.findIndex(
      (s: SubprocessHistoryType) => s.id === step.id
    );
    for (let i = currentIndex - 1; i >= 0; i--) {
      const media = steps[i]?.fieldSubprocess?.sampleMediaLink;
      if (Array.isArray(media) && media.length > 0) {
        return media;
      }
    }
    return [] as string[];
  }, [steps, step.id]);

  // Compute nearest previous FINAL_APPROVED_SAMPLE_IMAGE for current step
  const nearestApprovedSampleImage = useMemo(() => {
    if (!Array.isArray(steps) || !step?.id) return "";
    const currentIndex = steps.findIndex(
      (s: SubprocessHistoryType) => s.id === step.id
    );
    for (let i = currentIndex - 1; i >= 0; i--) {
      const img = steps[i]?.fieldSubprocess?.finalApprovedSampleImage;
      if (img && typeof img === "string" && img.trim().length > 0) {
        return img;
      }
    }
    return "";
  }, [steps, step.id]);

  // Compute nearest previous SAMPLE_PRODUCTION_PLAN
  const nearestSampleProductionPlan = useMemo(() => {
    if (!Array.isArray(steps) || !step?.id) return "";
    const currentIndex = steps.findIndex(
      (s: SubprocessHistoryType) => s.id === step.id
    );
    for (let i = currentIndex - 1; i >= 0; i--) {
      const plan = steps[i]?.fieldSubprocess?.sampleProductionPlan;
      if (plan && typeof plan === "string" && plan.trim().length > 0) {
        return plan;
      }
    }
    return "";
  }, [steps, step.id]);

  // Default sampleProductionPlan: prefer từ các bước trước, sau đó từ approvalInfo
  // Sử dụng useMemo để tránh dependency loop
  const sampleProductionPlanValue = useMemo(() => {
    // Ưu tiên 1: Lấy từ các bước trước (nearestSampleProductionPlan)
    if (nearestSampleProductionPlan) {
      return nearestSampleProductionPlan;
    }

    // Ưu tiên 2: Lấy từ previousStepValues
    if (previousStepValues.sampleProductionPlan) {
      return previousStepValues.sampleProductionPlan;
    }

    // Ưu tiên 3: Step 1 - lấy từ request.fieldSubprocess.sampleProductionPlan
    if (
      step?.step === 1 &&
      requestDetail?.fieldSubprocess?.sampleProductionPlan
    ) {
      return requestDetail.fieldSubprocess.sampleProductionPlan;
    }

    // Ưu tiên 4: Fallback cuối cùng từ approvalInfo.productionPlan
    if (requestDetail?.approvalInfo?.productionPlan) {
      return requestDetail.approvalInfo.productionPlan;
    }

    return null;
  }, [
    nearestSampleProductionPlan,
    // Chỉ lấy giá trị cụ thể thay vì toàn bộ object để tránh loop
    previousStepValues.sampleProductionPlan,
    step?.step,
    requestDetail?.fieldSubprocess?.sampleProductionPlan,
    requestDetail?.approvalInfo?.productionPlan,
  ]);

  // useEffect riêng để set value, chỉ chạy khi có thay đổi thực sự
  useEffect(() => {
    const current = getValues("fieldSubprocess.sampleProductionPlan") as
      | string
      | undefined;

    // Chỉ set value khi chưa có giá trị và có giá trị mới hợp lệ
    if (
      (!current || current.trim().length === 0) &&
      sampleProductionPlanValue
    ) {
      setValue(
        "fieldSubprocess.sampleProductionPlan",
        sampleProductionPlanValue,
        {
          shouldDirty: true,
          shouldValidate: false,
        }
      );
    }
  }, [sampleProductionPlanValue, setValue, getValues]);

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
    // if (completeMode) {
    //   const errors = validateRequiredFields(normalizedData);
    //   if (errors.length > 0) {
    //     setValidationErrors(errors);
    //     setShowValidationErrors(true);
    //     toast({
    //       title: "Lỗi validation",
    //       description:
    //         "Vui lòng điền đầy đủ các trường bắt buộc trước khi hoàn thành",
    //       variant: "destructive",
    //     });
    //     return;
    //   }
    // }

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
                <li
                  key={index}
                  className="text-sm text-red-700 flex items-center gap-2"
                >
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

        <CompletedFieldsDisplay
          step={step}
          fields={fields}
          shouldShowField={shouldShowField}
          getOptionsForField={getOptionsForField}
        />

        <DynamicFieldsSection
          fields={fields}
          control={control}
          shouldShowField={shouldShowField}
          step={step}
          nearestSampleMedia={nearestSampleMedia}
          nearestApprovedSampleImage={nearestApprovedSampleImage}
          previousStepValues={previousStepValues}
        />

        <div className="mt-6 border-t pt-4 flex justify-between items-center">
          <div className="flex justify-end gap-2">
            {/* Button Start Time - chỉ hiển thị nếu chưa có startTime */}
            {/* {!hasStartTime && (isAdmin || isAssignedUser) && ( */}
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
            {/* )} */}

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

            {/* Only show hold and complete buttons after start time */}
            {hasStartTime && (
              <>
                {/* Button Hold - Display only when step is in progress */}
                {(isAdmin || isAssignedUser) && holdInfo.canHold && (
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

                {/* Button Continue - Display when step is on hold */}
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

                {/* Button Complete - Hide when on hold */}
                {(isAdmin || isAssignedUser) && !holdInfo.isCurrentlyOnHold && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                      setCompleteMode(true);
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
              </>
            )}

            {/* Admin approval button for completed steps */}
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
        {/* Display completion note when step is completed but not approved */}
        {step.status === StatusSubprocessHistory.COMPLETED &&
          !step.isApproved && (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Bạn đã hoàn thành bước này, vui lòng chờ quản trị viên duyệt.
              </span>
            </div>
          )}

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
