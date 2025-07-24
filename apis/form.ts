import request from "@/configs/axios-config";
import { FileType } from "@/types/common";

export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await request.post<FileType>("/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (filename: string) => {
  try {
    await request.delete(`/files/${filename}`);
  } catch (error) {
    throw error;
  }
};

export const uploadMultipleFiles = async (files: File[]) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await request.post<FileType[]>(
      "/files/multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleFiles = async (filenames: string[]) => {
  try {
    await request.post(`/files/multiple`, { data: { filenames } });
  } catch (error) {
    throw error;
  }
};
