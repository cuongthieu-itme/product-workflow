import request from "@/configs/axios-config";
import { ChangeInfoInputType, ChangePasswordInputType } from "./schema";

export const changePassword = async (data: ChangePasswordInputType) => {
  try {
    const response = await request.patch("/auth/change-password", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const updateProfile = async (data: ChangeInfoInputType) => {
  try {
    const response = await request.put("/users", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};