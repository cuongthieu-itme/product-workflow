import request from "@/configs/axios-config";
import { UserFilterInput, UsersType } from "./type";
import { omitVoid } from "@/utils/removeParams";
import { CreateUserInputType, UpdatePasswordInputType } from "./schema";

export const getUsers = async (params?: UserFilterInput) => {
  try {
    const response = await request.get<UsersType>("/users", {
      params: omitVoid(params),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: CreateUserInputType) => {
  try {
    const response = await request.post<UserFilterInput>(
      "/users",
      omitVoid(data, ["departmentCode", "confirmPassword"])
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserPassword = async (
  id: string,
  data: UpdatePasswordInputType
) => {
  try {
    const response = await request.put(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  id: string,
  data: import("./schema/update-user-schema").UpdateUserInputType
) => {
  try {
    const response = await request.put(`/users/${id}`, omitVoid(data, ["departmentCode", "userName", "isVerifiedAccount"]));
    return response.data;
  } catch (error) {
    throw error;
  }
};
