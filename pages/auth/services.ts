import request from "@/configs/axiosConfig";
import { LoginInputType, RegisterInputType } from "./schema";
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

export const registerUser = async (data: RegisterInputType) => {
  try {
    const response = await request.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
