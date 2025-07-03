"use client";

import request from "@/configs/axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";

export const AxiosProvider = ({ children }: any) => {
  useEffect(() => {
    const resInterceptor = (response: AxiosResponse) => {
      return response;
    };

    const errInterceptor = (error: AxiosError) => {
      const customError = error.response?.data ?? {
        message: "Không thể kết nối đến máy chủ",
        status: error.response?.status,
      };

      return Promise.reject(customError);
    };

    const interceptor = request.interceptors.response.use(
      resInterceptor,
      errInterceptor
    );

    return () => request.interceptors.response.eject(interceptor);
  }, []);

  return children;
};
