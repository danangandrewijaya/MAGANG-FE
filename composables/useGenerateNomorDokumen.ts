import { ref } from 'vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'

/**
 * Composable to generate and create nomor dokumen
 * @param {object} params
 * @param {number} params.jenisNomorId - Required. Jenis nomor dokumen.
 * @param {number} [params.unitId] - Optional. If not provided, will use unitId from session.
 * @param {string} [params.tanggal] - Optional. Date string (ISO or yyyy-mm-dd).
 */
export function useGenerateNomorDokumen() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const session = useSessionStore().activeUser
  const sessionUnitId = session?.scopedModel?.unit?.id

  const generate = async ({ jenisNomorId, unitId, tanggal }: { jenisNomorId: number; unitId?: number; tanggal?: string }) => {
    if (!jenisNomorId)
      throw new Error('jenisNomorId wajib diisi')

    loading.value = true
    error.value = null
    data.value = null
    try {
      const resolvedUnitId = unitId ?? sessionUnitId
      if (!resolvedUnitId)
        throw new Error('unitId tidak ditemukan di parameter maupun session')

      const variables: any = {
        jenisNomorId,
        unitId: resolvedUnitId,
      }

      if (tanggal)
        variables.tanggal = tanggal

      const { execute, data: mutationData } = useGqlMutation('nomor_dokumen', 'create', {
        customSuccessMessage: 'Nomor dokumen berhasil dibuat',
      })

      await execute(variables)
      console.log('generateNomorDokumen res', mutationData.value)

      data.value = mutationData.value
    }
    catch (e: any) {
      error.value = e
      throw e
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    generate,
  }
}
