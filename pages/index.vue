<script setup lang="ts">
const { data: result, loading, error } = useGqlQuery('me', 'first')

console.log('userQuery: ', result)

const user = useSessionStore().activeUser

console.log('userSession: ', user)
</script>

<template>
  <div>
    <VCard
      class="mb-6"
      title="Kick start your project 🚀"
    >
      <VCardText>All the best for your new project.</VCardText>
      <VCardText>
        Please make sure to read our <a
          href="https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/documentation/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none"
        >
          Template Documentation
        </a> to understand where to go from here and how to use our template.
      </VCardText>
    </VCard>

    <VCard title="Want to integrate JWT? 🔒">
      <VCardText>We carefully crafted JWT flow so you can implement JWT with ease and with minimum efforts.</VCardText>
      <VCardText>Please read our JWT Documentation to get more out of JWT authentication.</VCardText>
    </VCard>

    <VCard
      class="mt-6"
      title="User Session"
    >
      <VCardText>
        <div v-if="loading">
          Loading...
        </div>
        <div v-else-if="error">
          Error: {{ error.message }}
        </div>
        <div v-else>
          <!-- {{ result }}<br> -->
          User : {{ user.name }}<br>
          NIP : {{ user.ssoIdentity || '-' }}<br>
          Role Code : {{ user.role }}<br>
          Role Name : {{ user.roleName }}<br>
          Unit Id : {{ user.scopedModel?.unit?.id }}<br>
          Unit Name : {{ user.scopedModel?.unit?.name }}<br>
          Sub Unit Id : {{ user.scopedModel?.subUnit?.id }}<br>
          Sub Unit Name : {{ user.scopedModel?.subUnit?.nama_subunit }}<br>
          Sub Sub Unit Id : {{ user.scopedModel?.subSubUnit?.id }}<br>
          Sub Sub Unit Name : {{ user.scopedModel?.subSubUnit?.nama_subsubunit }}<br>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
