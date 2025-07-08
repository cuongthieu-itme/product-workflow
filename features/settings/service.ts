import request from "@/configs/axios-config";
import { ChangePasswordInputType } from "./schema";

export const changePassword = async (data: ChangePasswordInputType) => {
  try {
    const response = await request.put("/auth/change-password");

    return response.data;
  } catch (error) {
    throw error;
  }
};
