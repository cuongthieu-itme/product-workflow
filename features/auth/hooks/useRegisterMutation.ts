import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export const useRegisterMutation = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      toast({
        title: "Đăng ký thành công!",
        description: "Bạn sẽ được chuyển hướng đến trang đăng nhập.",
        duration: 3000,
      });
      router.push("/login");
    },
  });
};
