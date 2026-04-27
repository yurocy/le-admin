import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getInfo, getUserMenus } from '@/api/system'
import { setToken, setUser, clearAuth, getToken, getUser } from '@/utils/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const userInfo = ref(getUser() || {} as any)
  const menuList = ref<any[]>([])
  const isSuperAdmin = ref(false)

  async function login(loginForm: { username: string; password: string }) {
    const res: any = await loginApi(loginForm)
    const { token: tk, user } = res.data
    token.value = tk
    userInfo.value = user
    isSuperAdmin.value = user.role >= 1000
    setToken(tk)
    setUser(user)
    return res
  }

  async function fetchUserInfo() {
    const res: any = await getInfo()
    userInfo.value = res.data
    isSuperAdmin.value = res.data.role >= 1000
    setUser(res.data)
    return res.data
  }

  async function fetchMenus() {
    const res: any = await getUserMenus()
    menuList.value = res.data || []
    return menuList.value
  }

  function logout() {
    token.value = ''
    userInfo.value = {} as any
    menuList.value = []
    isSuperAdmin.value = false
    clearAuth()
    router.push('/login')
  }

  return { token, userInfo, menuList, isSuperAdmin, login, fetchUserInfo, fetchMenus, logout }
})
