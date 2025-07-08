import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../service";

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
