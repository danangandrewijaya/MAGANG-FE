import { ref } from 'vue'

// Global state
const snackbarMessage = ref('')
const isSnackbarVisible = ref(false)
const isClosable = ref(false)
const snackbarColor = ref('') // State untuk warna snackbar

// Core function for showing snackbar
const showSnackbarCore = (
  message: string,
  color: string = 'primary',
  duration: number = 3000,
  closable: boolean = false,
) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  isSnackbarVisible.value = true
  isClosable.value = closable

  // Auto-hide jika tidak closable
  if (!closable) {
    setTimeout(() => {
      isSnackbarVisible.value = false
      snackbarMessage.value = ''
    }, duration)
  }
}

// Core function for closing snackbar
const closeSnackbarCore = () => {
  isSnackbarVisible.value = false
  snackbarMessage.value = ''
}

export function useSnackbar() {
  return {
    snackbarMessage,
    snackbarColor,
    isSnackbarVisible,
    isClosable,
    showSnackbar: showSnackbarCore,
    closeSnackbar: closeSnackbarCore,
  }
}

// Export individual functions for auto-import
export const showSnackbar = showSnackbarCore
export const closeSnackbar = closeSnackbarCore
