"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Pencil, Phone, Mail, Calendar, User } from "lucide-react";
import { useCustomerQuery } from "../../hooks";
import { getGender } from "../../utils";
import { UpdateCustomerForm } from "../update-customer-form";

interface CustomerInformationProps {
  customerId: string;
}

export function CustomerInformation({ customerId }: CustomerInformationProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: customer, isLoading } = useCustomerQuery(customerId);

  if (isLoading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-4">
        Không tìm thấy thông tin khách hàng
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Thông tin khách hàng</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditDialog(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Họ tên</p>
            <p className="font-medium">{customer.data.fullName}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Số điện thoại</p>
            <p className="font-medium flex items-center">
              {customer.data.phoneNumber ? (
                <>
                  <Phone className="mr-1 h-4 w-4" />
                  {customer.data.phoneNumber}
                </>
              ) : (
                "N/A"
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium flex items-center">
              {customer.data.email ? (
                <>
                  <Mail className="mr-1 h-4 w-4" />
                  {customer.data.email}
                </>
              ) : (
                "N/A"
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nguồn khách hàng</p>
            <p className="font-medium">{customer.data.source || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ngày sinh</p>
            <p className="font-medium flex items-center">
              {customer.data.dateOfBirth ? (
                <>
                  <Calendar className="mr-1 h-4 w-4" />
                  {format(customer.data.dateOfBirth, "dd/MM/yyyy")}
                </>
              ) : (
                "N/A"
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Giới tính</p>
            <p className="font-medium flex items-center">
              <User className="mr-1 h-4 w-4" />
              {getGender(customer.data.gender)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="text-sm">
              {format(customer.data.createdAt, "dd/MM/yyyy")}
            </p>
          </div>
          {customer.data.updatedAt &&
            customer.data.updatedAt !== customer.data.createdAt && (
              <div className="space-y-1 mt-2">
                <p className="text-sm text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="text-sm">
                  {format(customer.data.updatedAt, "dd/MM/yyyy")}
                </p>
              </div>
            )}
        </div>
      </CardContent>

      <UpdateCustomerForm
        customer={customer.data}
        onClose={() => setShowEditDialog(false)}
        onCustomerAdded={() => setShowEditDialog(false)}
        open={showEditDialog}
      />
    </Card>
  );
}
