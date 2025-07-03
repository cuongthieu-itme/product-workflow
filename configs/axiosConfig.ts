"use client";

import { getAccessTokenFromStorage } from "@/utils";
import axios, { AxiosError } from "axios";

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT_URL,
  timeout: 60 * 1000,
});

request.interceptors.request.use(
  function (config: any) {
    const token = getAccessTokenFromStorage();
    config.headers.Accept = "application/json";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error: any) {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error: AxiosError) {
    const customError = error.response?.data ?? {
      message: "Không thể kết nối đến máy chủ",
      status: error.response?.status,
    };

    return Promise.reject(customError);
  }
);

export default request;
