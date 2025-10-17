import { inject, provide, ref } from 'vue'

const isDialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const confirmAction = ref<() => void>(() => {})

function openDialog(title: string, message: string, onConfirm: () => void) {
  dialogTitle.value = title
  dialogMessage.value = message
  confirmAction.value = onConfirm
  isDialogVisible.value = true
}

function closeDialog() {
  isDialogVisible.value = false
}

function confirmDialog() {
  if (confirmAction.value)
    confirmAction.value()
  closeDialog()
}

export function useConfirmDialog() {
  provide('confirmDialog', { isDialogVisible, dialogTitle, dialogMessage, openDialog, closeDialog, confirmDialog })

  return { isDialogVisible, dialogTitle, dialogMessage, openDialog, closeDialog, confirmDialog }
}

export function useInjectedConfirmDialog() {
  const injectedConfirmDialog = inject('confirmDialog') as ReturnType<typeof useConfirmDialog>
  if (!injectedConfirmDialog)
    throw new Error('useConfirmDialog is not provided!')

  return injectedConfirmDialog
}

// Named exports for auto-import
export { closeDialog, confirmDialog, dialogMessage, dialogTitle, isDialogVisible, openDialog }
