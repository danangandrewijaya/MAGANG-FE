import { defineStore } from 'pinia'

interface ActiveUser {
  id: null | string
  uuid: null | string
  email: null | string
  name: null | string
  role: null | string
  roleName: null | string
  userRoleId: null | string
  selectedRole: null | any
  menu: null | object[]
  scopedModel: null | object[]
  ssoIdentity: null | string
  tahunAktif: null | string
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    token: null as string | null,

    activeUser: {
      id: null,
      uuid: null,
      email: null,
      name: null,
      role: null,
      roleName: null,
      userRoleId: null,
      menu: null,
      scopedModel: null,
      selectedRole: null as any,
      ssoIdentity: null,
      tahunAktif: null,
    } as ActiveUser,
  }),

  actions: {
    setToken(strToken: string) {
      this.token = strToken

      // Simpan token ke cookie untuk Apollo Client
      useCookie('auth_token', {
        // sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // Hanya set secure di production
      }).value = strToken
    },
    clearToken() {
      this.token = null
      useCookie('auth_token').value = null
    },
    setActiveUser(objUser: ActiveUser) {
      this.activeUser = objUser
    },
    clearActiveUser() {
      this.activeUser = {
        id: null,
        uuid: null,
        email: null,
        name: null,
        role: null,
        roleName: null,
        userRoleId: null,
        selectedRole: null,
        menu: null,
        scopedModel: null,
        ssoIdentity: null,
        tahunAktif: null,
      }
    },
    logout() {
      this.clearToken()
      this.clearActiveUser()
    },
  },

  persist: {
    storage: localStorage,
  },
})
