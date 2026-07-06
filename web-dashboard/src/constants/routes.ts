import type { RoleName } from '@/types/common.types'

export const routeSegments = {
  employees: 'employees',
  departments: 'departments',
  positions: 'positions',
  shifts: 'work-shifts',
  faceProfiles: 'face-profiles',
  onboarding: 'employee-onboarding',
  attendance: 'attendance',
  forgotPassword: 'forgot-password',
} as const

export const routePaths = {
  login: '/login',
  forgotPassword: `/${routeSegments.forgotPassword}`,
  dashboard: '/',
  employees: `/${routeSegments.employees}`,
  departments: `/${routeSegments.departments}`,
  positions: `/${routeSegments.positions}`,
  shifts: `/${routeSegments.shifts}`,
  faceProfiles: `/${routeSegments.faceProfiles}`,
  onboarding: `/${routeSegments.onboarding}`,
  attendance: `/${routeSegments.attendance}`,
} as const

export type NavigationItem = {
  label: string
  path: string
}

const adminNavigationItems: NavigationItem[] = [
  { label: 'Admin dashboard', path: routePaths.dashboard },
  { label: 'Nhân viên', path: routePaths.employees },
  { label: 'Đăng ký khuôn mặt', path: routePaths.onboarding },
  { label: 'Phòng ban', path: routePaths.departments },
  { label: 'Chức vụ', path: routePaths.positions },
  { label: 'Ca làm việc', path: routePaths.shifts },
  { label: 'Face profiles', path: routePaths.faceProfiles },
  { label: 'Chấm công', path: routePaths.attendance },
]

const hrNavigationItems: NavigationItem[] = [
  { label: 'HR dashboard', path: routePaths.dashboard },
  { label: 'Nhân viên', path: routePaths.employees },
  { label: 'Đăng ký khuôn mặt', path: routePaths.onboarding },
  { label: 'Phòng ban', path: routePaths.departments },
  { label: 'Chức vụ', path: routePaths.positions },
  { label: 'Ca làm việc', path: routePaths.shifts },
  { label: 'Face profiles', path: routePaths.faceProfiles },
  { label: 'Chấm công công ty', path: routePaths.attendance },
]

const managerNavigationItems: NavigationItem[] = [
  { label: 'Manager dashboard', path: routePaths.dashboard },
  { label: 'Team của tôi', path: routePaths.employees },
  { label: 'Ca làm việc', path: routePaths.shifts },
  { label: 'Chấm công team', path: routePaths.attendance },
]

const employeeNavigationItems: NavigationItem[] = []

export function getNavigationItemsForRole(role: RoleName | null | undefined): NavigationItem[] {
  if (role === 'admin') {
    return adminNavigationItems
  }

  if (role === 'hr') {
    return hrNavigationItems
  }

  if (role === 'manager') {
    return managerNavigationItems
  }

  if (role === 'employee') {
    return employeeNavigationItems
  }

  return []
}
