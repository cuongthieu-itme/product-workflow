import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services";

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};
