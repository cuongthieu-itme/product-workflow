import request from "@/configs/axios-config";
import { ChangeInfoInputType, ChangePasswordInputType } from "./schema";
import { BaseResultQuery, PaginatedResult } from "@/types/common";
import { CurrentUserType, NotificationType } from "./type";

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
    const response = await request.put("/users/profile", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAvatar = async (avatar: string) => {
  try {
    const response = await request.put("/users/profile", { avatar });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await request.get<BaseResultQuery<CurrentUserType>>(
      "/users/profile"
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getAvatarByFileName = async (fileName: string) => {
  try {
    const response = await request.get<BaseResultQuery<string>>(
      `/files/${fileName}`
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const removeFileByFileName = async (fileName: string) => {
  try {
    const response = await request.delete(`/files/${fileName}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNotificationSettings = async (page = 1, limit = 10) => {
  try {
    const response = await request.get<
      PaginatedResult<"data", NotificationType>
    >(`/notification-admins?page=${page}&limit=${limit}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsReadNotification = async (ids: number[]) => {
  try {
    const response = await request.put<{
      success: boolean;
      data: NotificationType;
    }>(`/notification-admins/is-read`, { ids });

    return response.data.data;
  } catch (error) {
    throw error;
  }
};
