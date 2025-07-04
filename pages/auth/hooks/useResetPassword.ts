import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      router.push("/login");
      toast(
        "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.",
        {
          description:
            "Bạn đã đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
          duration: 3000,
          action: {
            label: "Đăng nhập",
            onClick: () => {
              router.push("/login");
            },
          },
        }
      );
    },
  });
};
