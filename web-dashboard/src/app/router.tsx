import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleRoute } from '@/components/layout/RoleRoute'
import { routePaths, routeSegments } from '@/constants/routes'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeeListPage } from '@/features/employees/pages/EmployeeListPage'
import { DepartmentListPage } from '@/features/departments/pages/DepartmentListPage'
import { PositionListPage } from '@/features/positions/pages/PositionListPage'
import { ShiftManagementPage } from '@/features/shifts/pages/ShiftManagementPage'
import { FaceProfileListPage } from '@/features/face-profiles/pages/FaceProfileListPage'
import { EmployeeOnboardingPage } from '@/features/employee-onboarding/pages/EmployeeOnboardingPage'
import { AttendancePage } from '@/features/attendance/pages/AttendancePage'
import type { RoleName } from '@/types/common.types'

const withRoles = (allowedRoles: RoleName[], element: ReactElement) => (
  <RoleRoute allowedRoles={allowedRoles}>{element}</RoleRoute>
)

const adminHr: RoleName[] = ['admin', 'hr']
const staffDashboard: RoleName[] = ['admin', 'hr', 'manager']

export const router = createBrowserRouter([
  {
    path: routePaths.login,
    element: <LoginPage />,
  },
  {
    path: routePaths.forgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: routePaths.dashboard,
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: routeSegments.employees, element: withRoles(staffDashboard, <EmployeeListPage />) },
          { path: routeSegments.departments, element: withRoles(adminHr, <DepartmentListPage />) },
          { path: routeSegments.positions, element: withRoles(adminHr, <PositionListPage />) },
          { path: routeSegments.shifts, element: withRoles(staffDashboard, <ShiftManagementPage />) },
          { path: routeSegments.faceProfiles, element: withRoles(adminHr, <FaceProfileListPage />) },
          { path: routeSegments.onboarding, element: withRoles(adminHr, <EmployeeOnboardingPage />) },
          { path: routeSegments.attendance, element: withRoles(staffDashboard, <AttendancePage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={routePaths.dashboard} replace />,
  },
])
