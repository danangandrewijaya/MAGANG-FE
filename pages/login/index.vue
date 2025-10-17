<script setup lang="ts">
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

import authV2LoginIllustration from '@images/pages/auth-v2-login-illustration.png'

const config = useRuntimeConfig()
const session = useSessionStore()

definePageMeta({
  layout: 'blank',
  public: true,

})

const loginMutation = useGqlMutation('sign_in', 'upsert', {
  customSuccessMessage: 'Login berhasil',
})

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)

const login = async () => {
  if (!form.value.email || !form.value.password) {
    showSnackbar('Email/username dan password wajib diisi', 'error')

    return
  }
  session.clearToken()
  await loginMutation.execute({
    data: {
      email: form.value.email,
      password: form.value.password,
      app_code: config.public.appCode,
    },
  })

  const token = loginMutation.data.value?.token
  if (token) {
    session.setToken(token)
    navigateTo('/')
  }
}
</script>

<template>
  <a href="javascript:void(0)">
    <div class="auth-logo d-flex align-center gap-x-2">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </a>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <!-- illustration -->
      <div class="position-relative bg-background w-100 pa-8">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="700"
            :src="authV2LoginIllustration"
            class="auth-illustration"
          />
        </div>
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="login">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Email or Username"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="form.remember"
                    label="Remember me"
                  />
                  <a
                    class="text-primary"
                    href="javascript:void(0)"
                  >
                    Forgot Password?
                  </a>
                </div>

                <VBtn
                  block
                  color="info"
                  type="submit"
                >
                  Login
                </VBtn>
              </VCol>

              <!-- create account -->
              <!--
                <VCol
                cols="12"
                class="text-body-1 text-center"
                >
                <span class="d-inline-block">
                New on our platform?
                </span>
                <a
                class="text-primary ms-1 d-inline-block text-body-1"
                href="javascript:void(0)"
                >
                Create an account
                </a>
                </VCol>
              -->

              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>
            </VRow>
          </VForm>

          <br><br>
          <VRow>
            <!-- SSO -->
            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                :href="`${useRuntimeConfig().public.apiBaseUrl}login/simonev`"
                color="primary"
                block
                size="x-large"
                prepend-icon="ri-microsoft-fill"
              >
                Sign In with SSO
              </VBtn>
            </vcol>
          </VRow>
          <br>
          <div class="h-100 d-flex align-center justify-center text-small #text-medium-emphasis mt-4">
            <div class="d-flex flex-column align-items-center">
              <span
                class="d-md-flex gap-x-4 d-none"
                style="font-size: 0.7rem;"
              >
                <b>Version</b>: {{ appVersion.commit }}
              </span>
              <span
                class="d-md-flex gap-x-4 d-none"
                style="font-size: 0.7rem;"
              >
                <b>Build date</b>: {{ appVersion.buildDate }}
              </span>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
