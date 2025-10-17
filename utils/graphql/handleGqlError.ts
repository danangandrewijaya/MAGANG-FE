export function handleGqlError(error: any): boolean {
  const errorMessage = error?.message || ''

  const errorCode
    = error?.networkError?.statusCode
    || error?.graphQLErrors?.[0]?.extensions?.code
    || error?.code

  const unauthorized
    = errorMessage.includes('tahun_input')
    || errorMessage.includes('User not logged in')
    || errorMessage.toLowerCase().includes('token')
    || errorMessage.toLowerCase().includes('jwt')
    || errorMessage.toLowerCase().includes('authorization')
    || errorMessage.toLowerCase().includes('unauthorized')
    || errorMessage.toLowerCase().includes('auth')
    || errorCode === 'UNAUTHENTICATED'
    || errorCode === 'FORBIDDEN'
    || errorCode === '401'
    || errorCode === '403'

  if (unauthorized) {
    const sessionStore = useSessionStore()

    sessionStore.logout()
    showSnackbar('Session habis, silahkan login kembali.', 'error', 10000)
    navigateTo('/logout')

    return true
  }

  return false
}
