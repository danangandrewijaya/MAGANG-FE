import { print } from 'graphql/language/printer'
import gqlQuery from '~/graphql/index'
import { getTopLevelField } from '~/utils/graphql/getTopLevelField'
import { handleGqlError } from '~/utils/graphql/handleGqlError'

type CachePolicy = 'no-cache' | 'cache-first' | 'network-only'
type GqlQueryType = keyof typeof gqlQuery
type GqlQueryMode = 'get' | 'first' | 'directQuery'

export function useGqlQuery<T = any>(
  gqlData: GqlQueryType | string,
  mode: GqlQueryMode = 'get',
  variables = {},
  options: {
    cachePolicy?: CachePolicy
    useGlobalLoading?: boolean
    firstExecution?: boolean
  } = {},
) {
  const { client } = useApolloClient()

  const cachePolicy = options.cachePolicy ?? 'no-cache'
  const useGlobalLoading = options.useGlobalLoading ?? true
  const firstExecution = options.firstExecution ?? true

  const data = ref<T | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const error = ref<any>(null)

  let query, responseKey

  try {
    if (mode === 'directQuery') {
      const queryString = typeof gqlData === 'string' ? gqlData : print(gqlData)

      query = typeof gqlData === 'string' ? gql`${gqlData}` : gqlData
      responseKey = getTopLevelField(queryString)

      // console.log('query', query)
      // console.log('responseKey', responseKey)
    }
    else {
      const queryStr = (gqlQuery[gqlData as GqlQueryType] as any)?.[mode]

      query = gql`${queryStr}`
      responseKey = getTopLevelField(queryStr)

      // console.log('query', query)
      // console.log('responseKey', responseKey)
    }
  }
  catch (err) {
    error.value = err
    showSnackbar(`Query error: ${(err as Error).message}`, 'error', 5000)

    return { data, total, loading, error, refetch: async () => { } }
  }

  const fetchData = async (vars = variables) => {
    loading.value = true
    if (useGlobalLoading)
      startLoading()

    try {
      const res = await client.query({
        query,
        variables: vars,
        fetchPolicy: cachePolicy,
      })

      // Cek kalau ada GraphQL-level error
      if (res.errors?.length)
        throw new Error(res.errors[0].message || 'GraphQL error')

      const result = res?.data?.[responseKey]

      data.value = mode === 'first' ? result : result?.data ?? result
      total.value = result?.total ?? 0
    }
    catch (err: any) {
      // Ambil error dari graphQLErrors atau networkError.result.errors
      let errorMessage = err?.message || 'Unknown error'
      const networkErrors = err?.networkError?.result?.errors
      const validationError = networkErrors?.[0]

      if (validationError?.message)
        errorMessage = validationError.message

      error.value = {
        message: errorMessage,
        code: validationError?.extensions?.code || err?.networkError?.statusCode || null,
      }

      const unauthorized = handleGqlError(err)
      if (!unauthorized) {
        showSnackbar(`Error: ${errorMessage}`, 'error', 5000)
        console.error('GraphQL Query Error:', error.value)
      }
    }
    finally {
      loading.value = false
      if (useGlobalLoading)
        stopLoading()
    }
  }

  if (firstExecution)
    fetchData()

  const refetch = async (newVars = {}) => {
    await fetchData({ ...variables, ...newVars })
  }

  return { data, total, loading, error, refetch }
}
