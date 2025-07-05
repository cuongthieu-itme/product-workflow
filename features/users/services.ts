import request from "@/configs/axios-config";
import { UsersType } from "./type";

export const getUsers = async () => {
  try {
    const response = await request.get<UsersType>("/users");

    return response.data;
  } catch (error) {
    throw error;
  }
};
