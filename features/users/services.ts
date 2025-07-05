import request from "@/configs/axios-config";
import { UserFilterInput, UsersType } from "./type";
import { omitVoid } from "@/utils/removeParams";

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
