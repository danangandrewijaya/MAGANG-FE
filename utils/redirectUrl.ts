/**
 * Utility functions untuk menangani redirect URL dalam cookies
 */

const REDIRECT_URL_COOKIE = 'redirect_url'

/**
 * Simpan URL redirect ke dalam cookies
 * @param url - URL yang akan disimpan
 */
export function saveRedirectUrl(url: string) {
  const cookie = useCookie(REDIRECT_URL_COOKIE, {
    maxAge: 60 * 60 * 24, // 24 jam
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  cookie.value = url
}

/**
 * Ambil URL redirect dari cookies
 * @returns URL yang tersimpan atau null jika tidak ada
 */
export function getRedirectUrl(): string | null {
  const cookie = useCookie(REDIRECT_URL_COOKIE)

  return cookie.value || null
}

/**
 * Hapus URL redirect dari cookies
 */
export function clearRedirectUrl() {
  const cookie = useCookie(REDIRECT_URL_COOKIE)

  cookie.value = null
}

/**
 * Cek apakah URL adalah halaman verifikasi
 * @param url - URL yang akan dicek
 * @returns true jika URL adalah halaman verifikasi
 */
export function isVerificationUrl(url: string): boolean {
  return url.startsWith('/verifikasi/')
}
