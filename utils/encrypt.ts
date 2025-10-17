import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.NUXT_PUBLIC_SECRET_KEY || 'default-fallback-key'

// Helper: base64 to url-safe
function toUrlSafeBase64(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Helper: url-safe to base64
function fromUrlSafeBase64(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

  // Pad with = to make length multiple of 4
  while (base64.length % 4) base64 += '='

  return base64
}

// Encrypts the id of the user to be used in the URL
export const encryptId = (id: number | string): string => {
  const encrypted = CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString()

  return toUrlSafeBase64(encrypted)
}

// Decrypts the id of the user from the URL
export const decryptId = (encryptedId: string): number => {
  const encrypted = fromUrlSafeBase64(encryptedId)
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  const parsedId = Number.parseInt(decrypted, 10)
  if (Number.isNaN(parsedId))
    throw new Error('Decrypted ID is not a valid number.')

  return parsedId
}

// Encrypts a string to be used in the URL
export const encryptString = (plainString: string): string => {
  const encrypted = CryptoJS.AES.encrypt(plainString, SECRET_KEY).toString()

  return toUrlSafeBase64(encrypted)
}

// Decrypts the string from the URL
export const decryptString = (encryptedString: string): string => {
  const encrypted = fromUrlSafeBase64(encryptedString)
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)

  return bytes.toString(CryptoJS.enc.Utf8)
}
