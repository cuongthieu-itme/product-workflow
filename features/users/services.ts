import request from "@/configs/axios-config";
import { UserFilterInput, UsersType } from "./type";
import { omitVoid } from "@/utils/removeParams";
import { CreateUserInputType, UpdatePasswordInputType } from "./schema";
import { BaseResultQuery } from "@/types/common";
import { UserType } from "../auth/type";

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

export const getUserNoDepartments = async () => {
  try {
    const response = await request.get<BaseResultQuery<UserType[]>>(
      "/users/no-department/current"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: CreateUserInputType) => {
  try {
    const response = await request.post<UserFilterInput>("/users");
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
    const response = await request.put(
      `/users/${id}`,
      omitVoid(data, ["isVerifiedAccount"])
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /users/{id}
 */
export const deleteUser = async (id: string) => {
  try {
    const response = await request.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyUserAccount = async (id: string) => {
  try {
    const response = await request.patch(`/auth/verify-account`, {
      id,
      isVerifiedAccount: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUser = async (id: string) => {
  try {
    const response = await request.get<BaseResultQuery<UserType>>(
      `/users/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
