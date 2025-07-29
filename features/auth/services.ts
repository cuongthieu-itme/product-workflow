import request from "@/configs/axios-config";
import {
  ForgotPasswordInput,
  LoginInputType,
  RegisterInputType,
  ChangePasswordInputType,
} from "./schema";
import { UserType } from "./type";
import { ResetPasswordInputType } from "./schema/reset-password-schema";
import { omitVoid } from "@/utils/removeParams";

export const loginUser = async (data: LoginInputType) => {
  try {
    const response = await request.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const response = await request.get<UserType>("/auth/me");
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const registerUser = async (data: RegisterInputType) => {
  try {
    const response = await request.post(
      "/auth/register",
      omitVoid(data, ["confirmPassword"])
    );
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const forgotPassword = async (data: ForgotPasswordInput) => {
  try {
    const response = await request.post("/auth/forgot-password", data);
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const resetPassword = async ({
  token,
  newPassword,
}: ResetPasswordInputType) => {
  try {
    const response = await request.post(
      "/auth/reset-password",
      {
        newPassword,
      },
      {
        params: {
          token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const changePassword = async (data: { newPassword: string }) => {
  try {
    const response = await request.post("/auth/change-password", data);
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

export const skipFirstLogin = async () => {
  try {
    const response = await request.post("/auth/skip-first-login");
    return response.data;
  } catch (error) {
    console.error("Skip first login error:", error);
    throw error;
  }
};
