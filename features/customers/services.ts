import request from "@/configs/axios-config";
import { CustomerFilterInput, CustomersType, CustomerType } from "./type";
import { omitVoid } from "@/utils/removeParams";
import { BaseResultQuery } from "@/types/common";
import { CreateCustomerInputType, UpdateCustomerInputType } from "./schema";

export const getCustomers = async (params?: CustomerFilterInput) => {
  try {
    const response = await request.get<CustomersType>("/customers", {
      params: omitVoid(params),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCustomer = async (data: CreateCustomerInputType) => {
  try {
    const response = await request.post<CustomerType>("/customers", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (data: UpdateCustomerInputType) => {
  const { id, ...requestBody } = data;
  try {
    const response = await request.put(
      `/customers/${id}`,
      omitVoid(requestBody)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomer = async (id: string) => {
  try {
    const response = await request.get<BaseResultQuery<CustomerType>>(
      `/customers/${id}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (id: number) => {
  try {
    const response = await request.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
