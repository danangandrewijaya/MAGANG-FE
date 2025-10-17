<script setup>
startLoading('Logging out...')
useSessionStore().logout()

stopLoading()
navigateTo('/login')
</script>

<template>
  <div>Logging out...</div>
</template>
