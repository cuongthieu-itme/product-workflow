"use client";

import type React from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { RequestProvider } from "@/components/requests/request-context-firebase";
import { MaterialProvider } from "@/components/materials/material-context-firebase";
import { CustomerProvider } from "@/components/customers/customer-context";
import { ProductStatusProvider } from "@/components/product-status/product-status-context-firebase";
import { WorkflowProvider } from "@/components/workflow/workflow-context-firebase";
import { SubWorkflowProvider } from "@/components/workflow/sub-workflow-context-firebase";
import { StandardWorkflowProvider } from "@/components/workflow/standard-workflow-context-firebase";
import { PermissionsProvider } from "@/components/permissions-context";
import { AvailableVariablesProvider } from "@/components/variables/available-variables-context";
import { UserContextProvider } from "@/components/workflow/user-context-provider";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const MainShell = (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed width on desktop, slide-out on mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center border-b bg-background px-4 lg:px-6 h-14">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1">
            <Header />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PermissionsProvider>
        <UserContextProvider>
          <AvailableVariablesProvider>
            <ProductStatusProvider>
              <StandardWorkflowProvider>
                <SubWorkflowProvider>
                  <WorkflowProvider>
                    <MaterialProvider>
                      <CustomerProvider>
                        <RequestProvider>
                          {MainShell}
                          <Toaster />
                        </RequestProvider>
                      </CustomerProvider>
                    </MaterialProvider>
                  </WorkflowProvider>
                </SubWorkflowProvider>
              </StandardWorkflowProvider>
            </ProductStatusProvider>
          </AvailableVariablesProvider>
        </UserContextProvider>
      </PermissionsProvider>
    </ThemeProvider>
  );
}
