"use client";

import axios from "axios";

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT_URL,
  timeout: 60 * 1000,
});

request.interceptors.request.use(
  function (config: any) {
    const token = localStorage.getItem("token");
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

export default request;
