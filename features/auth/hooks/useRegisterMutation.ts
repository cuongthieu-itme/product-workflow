import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useRegisterMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      toast("Đăng ký thành công!", {
        description: "Bạn sẽ được chuyển hướng đến trang đăng nhập.",
        duration: 3000,
        action: {
          label: "Đăng nhập",
          onClick: () => {
            router.push("/login");
          },
        },
      });
    },
  });
};
