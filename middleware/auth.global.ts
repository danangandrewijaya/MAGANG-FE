import { isVerificationUrl, saveRedirectUrl } from '~/utils/redirectUrl'

export default defineNuxtRouteMiddleware(to => {
  if (isAuthenticated()) {
    if (to.path === '/login')
      return navigateTo('/')

    if (!isRoleAssigned() && to.path !== '/role' && to.path !== '/logout')
      return navigateTo('/role')
  }
  else if (!to.path.startsWith('/login') && to.path !== '/user-not-found') {
    // Jika user mengakses halaman verifikasi sebelum login, simpan URL tersebut
    if (isVerificationUrl(to.path))
      saveRedirectUrl(to.fullPath)

    return navigateTo('/login')
  }
})

function isAuthenticated() {
  return !!useSessionStore().token
}

function isRoleAssigned() {
  return !!useSessionStore().activeUser.role
}
