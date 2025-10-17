import { ref } from 'vue'

const isLoadingVisible = ref(false)
const loadingMessage = ref('')
const loadingCount = ref(0)
let hideTimeout: NodeJS.Timeout | null = null

function startLoading(message: string = '') {
  loadingCount.value++

  // Clear any pending hide timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  isLoadingVisible.value = true
  if (message)
    loadingMessage.value = message
}

function stopLoading() {
  loadingCount.value = Math.max(0, loadingCount.value - 1)
  if (loadingCount.value === 0) {
    // Add delay before hiding
    hideTimeout = setTimeout(() => {
      isLoadingVisible.value = false
      loadingMessage.value = ''
      hideTimeout = null
    }, 300) // 300ms delay
  }
}

function resetLoading() {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  loadingCount.value = 0
  isLoadingVisible.value = false
  loadingMessage.value = ''
}

export function useLoading() {
  return {
    isLoadingVisible,
    loadingMessage,
    startLoading,
    stopLoading,
    resetLoading,
  }
}

// Named exports for auto-import
export { isLoadingVisible, loadingMessage, resetLoading, startLoading, stopLoading }
