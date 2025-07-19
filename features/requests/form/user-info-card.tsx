"use client";

import { useGetUserInfoQuery } from "@/features/auth/hooks";
import { getDepartmentRole } from "@/features/settings/utils";

export const UserInfoCard = () => {
  const { data: currentUser } = useGetUserInfoQuery();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20" />

      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Người tạo yêu cầu
            </h3>
            <p className="text-xs text-blue-600">Thông tin người thực hiện</p>
          </div>
        </div>

        {/* User info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
              <svg
                className="h-3 w-3 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                {currentUser.fullName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-100">
              <svg
                className="h-3 w-3 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 00-2-2H8a2 2 0 00-2 2v9m8 0V9a2 2 0 012-2h2a2 2 0 012 2v12"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600">Phòng ban</div>
              <div className="text-sm font-medium text-purple-700">
                {getDepartmentRole(
                  currentUser.id,
                  currentUser?.department?.headId,
                  currentUser?.department?.id
                )}
              </div>
            </div>
          </div>

          {currentUser.email && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-green-100">
                <svg
                  className="h-3 w-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600">Email</div>
                <div className="text-sm font-medium text-green-700">
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
