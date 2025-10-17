import { dokumentQuery } from '@/graphql/modules/dokument'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Simple upload utility using fetch API
  const uploadFileToGraphQL = async (file: File, variables: any) => {
    const token = useCookie('auth_token')

    const formData = new FormData()

    // Add the GraphQL operation
    formData.append('operations', JSON.stringify({
      query: dokumentQuery.dokument.create,
      variables,
    }))

    // Add file mapping
    formData.append('map', JSON.stringify({ 0: ['variables.data.file'] }))

    // Add the actual file
    formData.append('0', file)

    const response = await fetch(`${config.public.apiBaseUrl}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : '',
      },
      body: formData,
    })

    const result = await response.json()
    if (result.errors && result.errors.length > 0)
      throw new Error(result.errors[0].message || 'Upload gagal')

    return result
  }

  return {
    provide: {
      uploadFileToGraphQL,
    },
  }
})
