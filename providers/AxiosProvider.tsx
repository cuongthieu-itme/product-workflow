"use client";

import request from "@/app/configs/axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";

export const AxiosProvider = ({ children }: any) => {
  useEffect(() => {
    const resInterceptor = (response: AxiosResponse) => {
      return response;
    };

    const errInterceptor = (error: AxiosError) => {
      return Promise.reject(error);
    };

    const interceptor = request.interceptors.response.use(
      resInterceptor,
      errInterceptor
    );

    return () => request.interceptors.response.eject(interceptor);
  }, []);

  return children;
};
