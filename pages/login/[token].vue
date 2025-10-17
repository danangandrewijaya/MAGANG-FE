<script setup>
const route = useRoute()
const token = route.params.token
const sessionStore = useSessionStore()
const alreadyLoggedIn = ref(false)

// Check if user is already logged in with a role selected
const currentUser = sessionStore.activeUser
const hasSelectedRole = currentUser && currentUser.userRoleId

// Handle SSO token based on current login state
if (hasSelectedRole) {
  // User is already logged in with a selected role
  // We should not replace their token in this case
  alreadyLoggedIn.value = true

  // Navigate to home instead of role selection page
  setTimeout(() => {
    navigateTo('/')
  }, 1500)
}
else {
  // User is not logged in or doesn't have a role selected
  // Save the SSO token and navigate to role selection
  sessionStore.setToken(token)
  setTimeout(() => {
    navigateTo('/role')
  }, 1500)
}
</script>

<template>
  <div>
    <VContainer>
      <VCard title="SSO Authentication">
        <VCardText>
          <VAlert
            v-if="alreadyLoggedIn"
            type="info"
            class="mb-4"
          >
            You are already logged in. Redirecting...
          </VAlert>
          <VAlert
            v-else
            type="success"
          >
            SSO Authentication successful. Redirecting...
          </VAlert>
        </VCardText>
      </VCard>
    </VContainer>
  </div>
</template>
