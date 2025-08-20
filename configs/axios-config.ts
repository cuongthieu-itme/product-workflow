"use client";

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  getAccessTokenFromStorage,
  removeAccessTokenFromStorage,
} from "@/utils";

/** Kiểu lỗi chuẩn hoá đưa về cho toàn bộ ứng dụng */
export interface ApiError<T = unknown> {
  message: string;
  status: number;
  data?: T;
}

const ONE_MINUTE = 60_000;

/** Axios instance dùng chung */
const request: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT_URL,
  timeout: ONE_MINUTE,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true, // gửi cookie (nếu có) cho các domain cùng nguồn
});

/* -------------------- Request interceptor -------------------- */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log dưới môi trường dev để dễ debug
    if (process.env.NODE_ENV !== "production") {
      console.info("[Request]", {
        method: config.method,
        url: config.url,
        headers: config.headers,
      });
    }

    return config;
  },
  (error: unknown) => Promise.reject(normalizeError(error))
);

/* -------------------- Response interceptor -------------------- */
request.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const normalized = normalizeError(error);

    // 401 => xoá token local, có thể điều hướng về /login nếu muốn
    if (normalized.status === 401) {
      removeAccessTokenFromStorage();
    }

    return Promise.reject(normalized);
  }
);

/* -------------------- Hàm chuẩn hoá lỗi -------------------- */
function normalizeError(error: unknown): ApiError {
  // Lỗi từ axios
  if (axios.isAxiosError(error)) {
    // Không có response: network, timeout, CORS...
    if (!error.response) {
      return {
        message: "Máy chủ không phản hồi hoặc không thể kết nối",
        status: 0,
      };
    }

    return {
      message:
        (error.response.data as any)?.message ??
        error.message ??
        "Lỗi không xác định từ máy chủ",
      status: error.response.status,
      data: error.response.data,
    };
  }

  // Các lỗi khác (ví dụ ném mới Error)
  return {
    message: (error as Error)?.message ?? "Lỗi không xác định",
    status: 0,
  };
}

export default request;
