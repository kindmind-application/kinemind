import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { CompaniesListPage } from "@/features/companies/pages/companies-list-page";
import { CompanyRegisterPage } from "@/features/companies/pages/company-register-page";
import { CompanyDetailPage } from "@/features/companies/pages/company-detail-page";
import { UserRegisterPage } from "@/features/users/pages/user-register-page";
import { DeviceAssignmentPage } from "@/features/devices/pages/device-assignment-page";
import { UsersListPage } from "@/features/users/pages/users-list-page";
import { DevicesListPage } from "@/features/devices/pages/devices-list-page";
import {
  ProductionPage,
  InventoryPage,
  LogisticsPage,
  SalesPage,
  SettingsPage,
} from "@/features/placeholder-pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "companies", element: <CompaniesListPage /> },
      { path: "companies/register", element: <CompanyRegisterPage /> },
      { path: "companies/:id", element: <CompanyDetailPage /> },
      { path: "users", element: <UsersListPage /> },
      { path: "users/register", element: <UserRegisterPage /> },
      { path: "devices", element: <DevicesListPage /> },
      { path: "devices/assign", element: <DeviceAssignmentPage /> },
      { path: "production", element: <ProductionPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "logistics", element: <LogisticsPage /> },
      { path: "sales", element: <SalesPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
