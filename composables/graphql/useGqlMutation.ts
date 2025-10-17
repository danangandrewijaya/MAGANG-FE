import { print } from 'graphql/language/printer'
import gqlQuery from '~/graphql/index'
import { getTopLevelField } from '~/utils/graphql/getTopLevelField'
import { handleGqlError } from '~/utils/graphql/handleGqlError'

type GqlMutationType = 'upsert' | 'create' | 'update' | 'delete' | 'directMutation'
type GqlQueryType = keyof typeof gqlQuery

export function useGqlMutation<T = any>(
  gqlData: GqlQueryType | string,
  mode: GqlMutationType = 'upsert',
  options: {
    cachePolicy?: 'no-cache' | 'network-only'
    showSuccessMessage?: boolean
    customSuccessMessage?: string
  } = {},
) {
  const { client } = useApolloClient()

  const cachePolicy = options.cachePolicy ?? 'no-cache'
  const showSuccessMessage = options.showSuccessMessage ?? true

  const loading = ref(false)
  const error = ref<any>(null)
  const data = ref<T | null>(null)

  let mutation, responseKey

  try {
    if (mode === 'directMutation') {
      const queryString = typeof gqlData === 'string' ? gqlData : print(gqlData)

      mutation = typeof gqlData === 'string' ? gql`${gqlData}` : gqlData
      responseKey = getTopLevelField(queryString)
    }
    else {
      const queryStr = (gqlQuery[gqlData as GqlQueryType] as any)?.[mode]

      mutation = gql`${queryStr}`
      responseKey = getTopLevelField(queryStr)
    }
  }
  catch (err) {
    error.value = err
    showSnackbar(`Mutation error: ${(err as Error).message}`, 'error', 5000)

    return { data, loading, error, execute: async () => {} }
  }

  const execute = async (variables = {}) => {
    loading.value = true
    startLoading('Processing...')

    try {
      const res = await client.mutate({ mutation, variables, fetchPolicy: cachePolicy })

      // Tangani error dari response
      if (res.errors?.length)
        throw new Error(res.errors[0].message || 'GraphQL mutation error')

      data.value = responseKey ? res?.data?.[responseKey] : res?.data

      if (showSuccessMessage)
        showSnackbar(options.customSuccessMessage ?? 'Data berhasil disimpan.', 'success')
    }
    catch (err: any) {
      const apolloErr = err

      const validationError
    = apolloErr?.networkError?.result?.errors?.[0]
    || apolloErr?.graphQLErrors?.[0]

      const errorMessage
    = validationError?.message
    || apolloErr?.message
    || 'Terjadi kesalahan saat melakukan mutasi.'

      error.value = {
        message: errorMessage,
        code: validationError?.extensions?.code || apolloErr?.networkError?.statusCode || null,
      }

      const unauthorized = handleGqlError(err)
      if (!unauthorized)
        showSnackbar(`Error: ${errorMessage}`, 'error', 5000)

      console.error('GraphQL Mutation Error:', error.value)
    }
    finally {
      loading.value = false
      stopLoading()
    }
  }

  return { data, loading, error, execute }
}
