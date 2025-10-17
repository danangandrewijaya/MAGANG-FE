<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
const { isMobile } = useDevice()
if (isMobile)
  configStore.appContentLayoutNav = 'vertical'

const { snackbarMessage, snackbarColor, isSnackbarVisible, isClosable, closeSnackbar } = useSnackbar()
const { isLoadingVisible, loadingMessage } = useLoading()
const { isDialogVisible, dialogTitle, dialogMessage, closeDialog, confirmDialog } = useConfirmDialog()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <NuxtLayout>
        <NuxtPage />

        <!-- Loading -->
        <VDialog
          v-model="isLoadingVisible"
          persistent
          width="400"
          style="z-index: 9999;"
        >
          <VCard class="fully-transparent">
            <VCardTitle class="text-center pt-4">
              <VChip
                color="primary"
                class="mb-4"
                x-large
                variant="elevated"
              >
                {{ loadingMessage || 'Loading...' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <Vue3Lottie
                animation-link="/lottie.json"
                :height="300"
                :width="300"
                loop
                autoplay
              />
            </VCardText>
          </VCard>
        </VDialog>

        <!-- Snackbar -->
        <VSnackbar
          v-model="isSnackbarVisible"
          :color="snackbarColor"
          :timeout="isClosable ? -1 : 3000"
          location="top"
        >
          <span
            v-if="snackbarColor === 'error'"
            style="font-size: 1rem;"
          >
            {{ snackbarMessage }}
          </span>
          <span v-else>
            {{ snackbarMessage }}
          </span>
          <!-- Tombol tutup opsional -->
          <template #actions>
            <VBtn
              v-if="isClosable"
              :color="`light-${snackbarColor}`"
              @click="closeSnackbar"
            >
              Close
            </VBtn>
          </template>
        </VSnackbar>

        <!-- Confirm Dialog -->
        <VDialog
          v-model="isDialogVisible"
          persistent
          class="v-dialog-sm"
        >
          <VCard :title="dialogTitle">
            <DialogCloseBtn
              variant="text"
              size="default"
              @click="closeDialog"
            />

            <VCardText>{{ dialogMessage }}</VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn
                color="primary"
                variant="elevated"
                @click="confirmDialog"
              >
                <VIcon start>
                  bx-check-circle
                </VIcon>
                Setuju
              </VBtn>
              <VBtn
                color="secondary"
                variant="outlined"
                @click="closeDialog"
              >
                <VIcon start>
                  bx-x-circle
                </VIcon>
                Batal
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>
      </NuxtLayout>

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>

<style>
.fully-transparent {
  background: transparent !important;
  box-shadow: none !important;
}
</style>
