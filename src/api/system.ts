import request from '@/utils/request'

// Auth & System APIs
export function login(data: { username: string; password: string }) {
  return request.post('/auth/login', data)
}

export function getInfo() {
  return request.get('/auth/info')
}

export function changePassword(data: { old_password: string; new_password: string }) {
  return request.put('/auth/password', data)
}

export function getUserMenus() {
  return request.get('/auth/menus')
}

// Admin User Management
export function listAdminUsers(params: any) {
  return request.get('/admin/users', { params })
}

export function getAdminUser(id: number) {
  return request.get(`/admin/users/${id}`)
}

export function createAdminUser(data: any) {
  return request.post('/admin/users', data)
}

export function updateAdminUser(id: number, data: any) {
  return request.put(`/admin/users/${id}`, data)
}

export function deleteAdminUser(id: number) {
  return request.delete(`/admin/users/${id}`)
}

// Role Management
export function listRoles(params?: any) {
  return request.get('/admin/roles', { params })
}

export function getRole(id: number) {
  return request.get(`/admin/roles/${id}`)
}

export function createRole(data: any) {
  return request.post('/admin/roles', data)
}

export function updateRole(id: number, data: any) {
  return request.put(`/admin/roles/${id}`, data)
}

export function deleteRole(id: number) {
  return request.delete(`/admin/roles/${id}`)
}

export function updateRoleMenus(id: number, menuIds: number[]) {
  return request.put(`/admin/roles/${id}/menus`, { menu_ids: menuIds })
}

// Menu Management
export function listMenus(params?: any) {
  return request.get('/admin/menus', { params })
}

export function getMenu(id: number) {
  return request.get(`/admin/menus/${id}`)
}

export function createMenu(data: any) {
  return request.post('/admin/menus', data)
}

export function updateMenu(id: number, data: any) {
  return request.put(`/admin/menus/${id}`, data)
}

export function deleteMenu(id: number) {
  return request.delete(`/admin/menus/${id}`)
}

// Operation Logs
export function listLogs(params: any) {
  return request.get('/admin/logs', { params })
}

// Dashboard
export function getDashboard() {
  return request.get('/admin/dashboard')
}
