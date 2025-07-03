import request from "@/configs/axiosConfig";
import { LoginInputType } from "./schema";
import { UserType } from "./type";

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
