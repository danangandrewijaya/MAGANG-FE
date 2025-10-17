<script setup lang="ts">
import { useGqlQuery } from '@/composables/graphql/useGqlQuery';
import { useGenerateNomorDokumen } from '@/composables/useGenerateNomorDokumen';
import { showSnackbar } from '@/composables/useSnackbar';
import { useSessionStore } from '@/stores/session';
import { computed, onMounted, ref, watch } from 'vue';
import { VAutocomplete } from 'vuetify/components';


const apollo = useApolloClient()

interface Props {
  mode: 'create' | 'edit'
  contractId?: number | null
  paketPengadaanId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  contractId: null,
  paketPengadaanId: null,
})

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const searchPaketPengadaan = ref('');
// const unitId = ref<number | null>(null)

// const fetchUnits = async () => {
//   const sessionStore = useSessionStore()
//   const user = sessionStore.activeUser
//   if (user?.scopedModel?.unit?.id) {
//     unitId.value = Number(user.scopedModel.unit.id)
//   } else {
//     console.warn('No unit ID found in session user')
//   }
// }

// Query untuk mengambil data kontrak jika mode edit
const { data: contractData, refetch: fetchContract } = useGqlQuery(
  'kontrak',
  'first',
  { getKontrakId: props.contractId },
  { firstExecution: false },
)

const unitId = computed(() => {
  // Mode edit: ambil dari contractData jika tersedia
  if (props.mode === 'edit' && contractData.value?.paketPengadaan?.unit?.id) {
    return Number(contractData.value.paketPengadaan.unit.id)
  }

  // Fallback ke globalUnitCode jika tersedia
  if (globalUnitCode.value) {
    return Number(globalUnitCode.value)
  }

  return paketPengadaanDataAdd.value?.unit?.id ? Number(paketPengadaanDataAdd.value.unit.id) : null
})

const { data: currentUserData, refetch: fetchCurrentUser } = useGqlQuery(
  'me',
  'first',
  {},
  { firstExecution: true },
)

const extractUnitCodeFromUser = (userData: any): string | null => {
  if (!userData?.userRole) return null
  const scopedRole = userData.userRole.find((role: any) =>
    role.scopedModel?.unit?.kode_unit
  )
  return scopedRole?.scopedModel?.unit?.kode_unit || null
}

const currentUserUnitCode = computed(() => {
  if (!currentUserData.value) return null
  const unitCode = extractUnitCodeFromUser(currentUserData.value)
  return unitCode
})
const globalUnitCode = ref<string | null>(null)

watch(currentUserUnitCode, (newUnitCode) => {
  globalUnitCode.value = newUnitCode
  // console.log('globalUnitCode', globalUnitCode.value);

}, { immediate: true })

// console.log('globalUnitCode', globalUnitCode.value);

// Query untuk mengambil data paket pengadaan
const { data: paketPengadaanData, refetch: fetchPaketPengadaan } = useGqlQuery(
  'paket_pengadaan',
  'get',
  { page: 1, limit: 10, filter: { nama_paket: '' } },
  { firstExecution: true },
)

const { data: paketPengadaanDataAdd, refetch: fetchPaketPengadaanAdd } = useGqlQuery(
  'paket_pengadaan',
  'first',
  { getPaketPengadaanId: props.paketPengadaanId },
  { firstExecution: props.mode === 'create' && props.paketPengadaanId ? true : false },
)

const sumberDanaId = computed(() => {
  if (paketPengadaanDataAdd.value?.sumberDanaId !== undefined && paketPengadaanDataAdd.value?.sumberDanaId !== null) {
    const result = Number(paketPengadaanDataAdd.value.sumberDanaId)
    return result
  }
  return null
})


// Watch untuk memantau perubahan sumberDanaId
watch(sumberDanaId, (newValue) => {
}, { immediate: true })

// Watch untuk memantau perubahan paketPengadaanDataAdd
watch(paketPengadaanDataAdd, (newValue) => {
  if (newValue?.sumberDanaId) {
  }
}, { immediate: true })


// Query untuk mengambil data penyedia
const { data: penyediaData, refetch: fetchPenyedia } = useGqlQuery(
  'penyedia',
  'get',
  { page: 1, limit: 10 },
  { firstExecution: true },
)

// Add reactive variables for sub sub unit search
const searchSubSubUnitQuery = ref('')
const subSubUnitData = ref([])


// Query untuk mengambil data sub sub unit awal - ubah ke firstExecution: false
const { data: initialSubSubUnitData, refetch: fetchInitialSubSubUnit } = useGqlQuery(
  'sub_sub_unit',
  'get',
  { page: 1, limit: 10, idUnit: null },
  { firstExecution: false },
)

const searchSubSubUnit = async (search: string) => {
  // Ambil unitId yang dinamis
  const currentUnitId = unitId.value
  const sessionStore = useSessionStore()
  const userRole = sessionStore.activeUser?.role

  // Jika user adalah admin, jangan gunakan filter idUnit
  const isAdmin = userRole === 'admin'

  if (!currentUnitId && !isAdmin) {
    console.warn('unitId tidak tersedia untuk search sub sub unit')
    return []
  }

  const variables: any = { search, limit: 10 }

  // Jika admin, set idUnit ke null, jika bukan admin gunakan currentUnitId
  if (isAdmin) {
    variables.idUnit = null
  } else if (currentUnitId) {
    variables.idUnit = Number(currentUnitId)
  }

  const { data } = await apollo.client.query({
    query: gql`query GetListSubSubUnit($search: String, $limit: Int, $idUnit: Int) {
      getListSubSubUnit(search: $search, limit: $limit, id_unit: $idUnit) {
      data {
        id
        subunit {
          id
          unit {
            id
            cuid
            kode_unit
            nama_unit
          }
          cuid
          kode_subunit
          nama_subunit
        }
        cuid
        kode_subsubunit
        nama_subsubunit
      }
      total
    }
  }`,
    variables,
    fetchPolicy: 'network-only',
  })

  subSubUnitData.value = data.getListSubSubUnit.data
  return data.getListSubSubUnit.data
}

// Add reactive variables for penyedia search
const searchPenyediaQuery = ref('')
const penyediaSearchData = ref([])

const searchPenyedia = async (search: string) => {
  const { data } = await apollo.client.query({
    query: gql`query GetListPenyedia($filter: PenyediaFilterInput, $limit: Int) {
      getListPenyedia(filter: $filter, limit: $limit) {
        data {
          id
          nama_penyedia
          alamat
          email
          no_telepon
        }
        total
      }
    }`,
    variables: { filter: { nama_penyedia: search }, limit: 10 },
    fetchPolicy: 'network-only',
  })

  // Update the reactive data
  penyediaSearchData.value = data.getListPenyedia.data
  return data.getListPenyedia.data
}

// Add reactive variables for PPK search
const searchPpkQuery = ref('')
const ppkSearchData = ref([])

const searchPpk = async (search: string) => {
  const { data } = await apollo.client.query({
    query: gql`query GetUserListByRole($roleCode: String!) {
      GetUserListByRole(role_code: $roleCode) {
        data {
          id
          email
          name
          telepon
          sso_identity
        }
        total
      }
    }`,
    fetchPolicy: 'network-only',
    variables: { roleCode: 'ppk' },
  })
  // console.log('searchPpkData', data)

  // Filter berdasarkan search term
  let filteredUsers = data.getAllUsers
  if (search) {
    filteredUsers = data.getAllUsers.filter((user: any) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Update the reactive data
  ppkSearchData.value = filteredUsers
  return filteredUsers
}

// Fetch initial PPK data
const fetchInitialPpkData = async () => {
  try {
    const { data } = await apollo.client.query({
      query: gql`query GetUserListByRole($roleCode: String!) {
      GetUserListByRole(role_code: $roleCode) {
        data {
          id
          email
          name
          telepon
          sso_identity
        }
        total
      }
    }`,
      fetchPolicy: 'cache-first',
      variables: { roleCode: 'ppk' },
    })
    ppkSearchData.value = data.GetUserListByRole.data
  } catch (error) {
    console.error('Error fetching initial PPK data:', error)
  }
}

// Watch untuk refetch data ketika searchPaketPengadaan berubah
watch(searchPaketPengadaan, async (newSearch) => {
  if (newSearch.length >= 3 || newSearch === '') {
    loading.value = true;
    try {
      await fetchPaketPengadaan({ filter: { nama_paket: newSearch } });
    } catch (error) {
      console.error('Error fetching paket pengadaan:', error);
    } finally {
      loading.value = false;
    }
  }
});

// Watch for changes in paket pengadaan data
watch(paketPengadaanData, (newData) => {
}, { immediate: true })

// Watch for sub sub unit search changes
watch(searchSubSubUnitQuery, async (newSearch) => {
  if (newSearch && newSearch.length >= 3) {
    try {
      await searchSubSubUnit(newSearch);
      // console.log('subSubUnitData', subSubUnitData.value);
    } catch (error) {
      console.error('Error fetching sub sub unit:', error);
    }
  } else if (newSearch === '') {
    // Reset to initial data when search is cleared
    if (initialSubSubUnitData.value) {
      subSubUnitData.value = initialSubSubUnitData.value;
    }
  }
});

// Watch for penyedia search changes
watch(searchPenyediaQuery, async (newSearch) => {
  if (newSearch && newSearch.length >= 3) {
    try {
      await searchPenyedia(newSearch);
      // console.log('penyediaSearchData', penyediaSearchData.value);
    } catch (error) {
      console.error('Error fetching penyedia:', error);
    }
  } else if (newSearch === '') {
    penyediaSearchData.value = [];
  }
});

// Watch for changes in penyedia data
watch(penyediaData, (newData) => {
}, { immediate: true })

// Watch for initial sub sub unit data
watch(initialSubSubUnitData, (newData) => {
  if (newData && !searchSubSubUnitQuery.value) {
    // Only use initial data when not searching
    subSubUnitData.value = newData;
  }
}, { immediate: true })

// Watch for PPK search changes
watch(searchPpkQuery, async (newSearch) => {
  if (newSearch && newSearch.length >= 2) {
    try {
      await searchPpk(newSearch);
      // console.log('ppkSearchData', ppkSearchData.value);
    } catch (error) {
      console.error('Error fetching PPK:', error);
    }
  } else if (newSearch === '') {
    // Reset to initial data when search is cleared
    await fetchInitialPpkData();
  }
});

// Watch for initial PPK data
watch(ppkSearchData, (newData) => {
  if (newData && !searchPpkQuery.value) {
    // Only use initial data when not searching
    // console.log('Initial PPK data loaded:', newData);
  }
}, { immediate: true })

// Tambahkan watcher untuk unitId
watch(unitId, async (newUnitId) => {
  const sessionStore = useSessionStore()
  const userRole = sessionStore.activeUser?.role
  const isAdmin = userRole === 'admin'

  // Jika admin, set idUnit ke null, jika bukan admin gunakan newUnitId
  const variables: any = { page: 1, limit: 10 }
  if (isAdmin) {
    variables.idUnit = null
  } else if (newUnitId) {
    variables.idUnit = newUnitId
  }

  try {
    await fetchInitialSubSubUnit(variables)
    // console.log('Sub sub unit data fetched successfully')
  } catch (error) {
    console.error('Error fetching sub sub unit with unitId:', error)
  }
}, { immediate: true })

// Modifikasi watcher paketPengadaanDataAdd (hapus logic unitId karena sudah di handle di atas)
watch(paketPengadaanDataAdd, (newData) => {
  if (newData && props.mode === 'create' && props.paketPengadaanId) {
    // console.log('paketPengadaanDataAdd loaded:', newData)

    // Pastikan form.paketPengadaanId sudah di-set
    if (!form.value.paketPengadaanId) {
      form.value.paketPengadaanId = props.paketPengadaanId
      console.log('Watcher set paketPengadaanId:', props.paketPengadaanId)
    }
  }
}, { immediate: true })

const form = ref({
  nomor_kontrak: '',
  nilai_kontrak: '',
  jangka_waktu: '',
  tanggal_kontrak: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  tanggal_spmk: '',
  nomor_spmk: '',
  tanggal_sppbj: '',
  nomor_sppbj: '',
  paketPengadaanId: null as number | null,
  penyediaId: null as number | null,
  subsubunitId: null as number | null,
  ppkId: '',
})

// Tambahkan reactive variable untuk unitId
const currentUnitId = ref<number | null>(null)

const formRules = {
  nomor_kontrak: [
  ],
  nilai_kontrak: [
    (v: string) => !!v || 'Nilai kontrak wajib diisi',
    (v: string) => {
      const cleanValue = v.replace(/\D/g, '')
      return !isNaN(Number(cleanValue)) || 'Nilai kontrak harus berupa angka'
    },
    (v: string) => {
      const cleanValue = v.replace(/\D/g, '')
      return Number(cleanValue) > 0 || 'Nilai kontrak harus lebih dari 0'
    },
  ],
  jangka_waktu: [
    (v: string) => !!v || 'Jangka waktu wajib diisi',
    (v: string) => !isNaN(Number(v)) || 'Jangka waktu harus berupa angka',
    (v: string) => Number(v) > 0 || 'Jangka waktu harus lebih dari 0',
  ],
  tanggal_kontrak: [
  ],
  tanggal_mulai: [
  ],
  tanggal_selesai: [
  ],
  tanggal_spmk: [
  ],
  nomor_spmk: [
  ],
  tanggal_sppbj: [
    (v: string) => !!v || 'Tanggal SPPBJ wajib diisi',
  ],
  nomor_sppbj: [
    (v: string) => !!v || 'Nomor SPPBJ wajib diisi',
    (v: string) => v.length >= 3 || 'Nomor SPPBJ minimal 3 karakter',
  ],
  paketPengadaanId: [
    (v: number | null) => !!v || 'Paket pengadaan wajib dipilih',
  ],
  penyediaId: [
    (v: number | null) => !!v || 'Penyedia wajib dipilih',
  ],
  subsubunitId: [
    (v: number | null) => !!v || 'Sub sub unit wajib dipilih',
  ],
  ppkId: [
    (v: string) => !!v || 'Nama PPK wajib dipilih',
  ],
}

const formValid = ref(false)
const loading = ref(false)

const formattedNilaiKontrak = computed({
  get: () => {
    if (!form.value.nilai_kontrak) return ''
    const cleanValue = form.value.nilai_kontrak.toString().replace(/\D/g, '')
    if (!cleanValue) return ''
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  },
  set: (value: string) => {
    form.value.nilai_kontrak = value.replace(/\D/g, '')
  }
})

// Method untuk mengkonversi format ke number
const convertToNumber = (value: string): number => {
  return Number(value.replace(/\D/g, ''))
}
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Query untuk mengambil data kontrak jika mode edit
// const { data: contractData, refetch: fetchContract } = useGqlQuery(
//   'kontrak',
//   'first',
//   { getKontrakId: props.contractId },
//   { firstExecution: false },
// )

// Load data jika mode edit
onMounted(async () => {
  // Fetch unitId first
  // await fetchUnits()

  await fetchCurrentUser()

  try {
    // Set paket pengadaan ID untuk mode create
    if (props.mode === 'create' && props.paketPengadaanId) {
      form.value.paketPengadaanId = props.paketPengadaanId
      // console.log('Set paketPengadaanId for create mode:', props.paketPengadaanId)
    }

    // Fetch initial PPK data
    await fetchInitialPpkData()
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }

  if (props.mode === 'edit' && props.contractId) {
    loading.value = true
    try {
      await fetchContract({ id: props.contractId })
      if (contractData.value) {
        const loadedData = {
          nomor_kontrak: contractData.value.nomor_kontrak || '',
          nilai_kontrak: contractData.value.nilai_kontrak?.toString() || '',
          nama_ppk: contractData.value.nama_ppk || '',
          nip_ppk: contractData.value.nip_ppk || '',
          jangka_waktu: contractData.value.jangka_waktu?.toString() || '',
          tanggal_kontrak: contractData.value.tanggal_kontrak ? new Date(contractData.value.tanggal_kontrak).toISOString().split('T')[0] : '',
          tanggal_mulai: contractData.value.tanggal_mulai ? new Date(contractData.value.tanggal_mulai).toISOString().split('T')[0] : '',
          tanggal_selesai: contractData.value.tanggal_selesai ? new Date(contractData.value.tanggal_selesai).toISOString().split('T')[0] : '',
          tanggal_spmk: contractData.value.tanggal_spmk ? new Date(contractData.value.tanggal_spmk).toISOString().split('T')[0] : '',
          nomor_spmk: contractData.value.nomor_spmk || '',
          tanggal_sppbj: contractData.value.tanggal_sppbj ? new Date(contractData.value.tanggal_sppbj).toISOString().split('T')[0] : '',
          nomor_sppbj: contractData.value.nomor_sppbj || '',
          paketPengadaanId: contractData.value.paketPengadaan || null,
          penyediaId: contractData.value.penyedia || null,
          subsubunitId: contractData.value.subsubunit || null,
          ppkId: contractData.value.ppk || null,
        }

        console.log('loadedDataxx', loadedData)

        form.value = { ...loadedData }
      }
    }
    catch (error) {
      console.error('Error loading contract data:', error)
    }
    finally {
      loading.value = false
    }
  }
})

const handleSubmit = async () => {
  if (!formValid.value) {
    // console.log('Form validation failed')
    return
  }

  const formData: any = {
    nomor_kontrak: form.value.nomor_kontrak,
    nilai_kontrak: convertToNumber(form.value.nilai_kontrak),
    jangka_waktu: Number(form.value.jangka_waktu),
    tanggal_sppbj: form.value.tanggal_sppbj,
    nomor_sppbj: form.value.nomor_sppbj,
    paketPengadaanId: Number(form.value.paketPengadaanId?.id),
    penyediaId: Number(form.value.penyediaId?.id),
    subsubunitId: Number(form.value.subsubunitId?.id),
    ppkId: form.value.ppkId?.id,
  }

  if (props.mode === 'create') {
    formData.paketPengadaanId = Number(form.value.paketPengadaanId)
  }

  // Add sumberDanaId if available
  if (sumberDanaId.value) {
    formData.sumberDanaId = sumberDanaId.value
  }

  // Only include date fields if they have valid values
  if (form.value.tanggal_mulai && form.value.tanggal_mulai.trim() !== '') {
    formData.tanggal_mulai = form.value.tanggal_mulai
  }

  if (form.value.tanggal_selesai && form.value.tanggal_selesai.trim() !== '') {
    formData.tanggal_selesai = form.value.tanggal_selesai
  }

  // Only include optional fields if they have values
  if (form.value.tanggal_kontrak && form.value.tanggal_kontrak.trim() !== '') {
    formData.tanggal_kontrak = form.value.tanggal_kontrak
  }

  if (form.value.tanggal_spmk && form.value.tanggal_spmk.trim() !== '') {
    formData.tanggal_spmk = form.value.tanggal_spmk
  }

  if (form.value.nomor_spmk && form.value.nomor_spmk.trim() !== '') {
    formData.nomor_spmk = form.value.nomor_spmk
  }

  emit('submit', formData)
}

const handleCancel = () => {
  emit('cancel')
}

// Tambahkan fungsi generate nomor
// const handleGenerateNomorKontrak = async () => {
//   try {
//     const jenisNomorId = 1
//     const tanggal = form.value.tanggal_kontrak
//     if (!unitId.value) {
//       showSnackbar('Sub sub unit belum dipilih atau unit tidak ditemukan', 'error')
//       return
//     }
//     if (!tanggal) {
//       showSnackbar('Tanggal kontrak wajib diisi', 'error')
//       return
//     }
//     const { generate, data, error, loading } = useGenerateNomorDokumen()
//     await generate({ jenisNomorId, unitId: unitId.value, tanggal })
//     if (data.value && (data.value as any)?.nomorLengkap) {
//       form.value.nomor_kontrak = (data.value as any).nomorLengkap
//       showSnackbar('Nomor Kontrak berhasil digenerate', 'success')
//     } else {
//       showSnackbar('Gagal generate nomor Kontrak', 'error')
//     }
//   } catch (e: any) {
//     showSnackbar(e.message || 'Gagal generate nomor Kontrak', 'error')
//   }
// }

// const handleGenerateNomorSPPBJ = async () => {
//   try {
//     const jenisNomorId = 2
//     const tanggal = form.value.tanggal_sppbj
//     if (!unitId.value) {
//       showSnackbar('Unit tidak ditemukan', 'error')
//       return
//     }
//     if (!tanggal) {
//       showSnackbar('Tanggal SPPBJ wajib diisi', 'error')
//       return
//     }

//     const { generate, data, error, loading } = useGenerateNomorDokumen()
//     await generate({ jenisNomorId, unitId: unitId.value, tanggal })
//     if (data.value && (data.value as any)?.nomorLengkap) {
//       form.value.nomor_sppbj = (data.value as any).nomorLengkap
//       showSnackbar('Nomor SPPBJ berhasil digenerate', 'success')
//     } else {
//       showSnackbar('Gagal generate nomor SPPBJ', 'error')
//     }
//   } catch (e: any) {
//     showSnackbar(e.message || 'Gagal generate nomor SPPBJ', 'error')
//   }
// }
// const handleGenerateNomorSPMK = async () => {
//   try {
//     const jenisNomorId = 3
//     const tanggal = form.value.tanggal_spmk
//     if (!unitId.value) {
//       showSnackbar('Unit tidak ditemukan', 'error')
//       return
//     }
//     if (!tanggal) {
//       showSnackbar('Tanggal SPMK wajib diisi', 'error')
//       return
//     }
//     const { generate, data, error, loading } = useGenerateNomorDokumen()
//     await generate({ jenisNomorId, unitId: unitId.value, tanggal })
//     if (data.value && (data.value as any)?.nomorLengkap) {
//       form.value.nomor_spmk = (data.value as any).nomorLengkap
//       showSnackbar('Nomor SPMK berhasil digenerate', 'success')
//     } else {
//       showSnackbar('Gagal generate nomor SPMK', 'error')
//     }
//   } catch (e: any) {
//     showSnackbar(e.message || 'Gagal generate nomor SPMK', 'error')
//   }
// }
const handleGenerateNomorKontrak = async () => {
  try {
    const jenisNomorId = 1
    let unitId: number | null = null

    // Coba ambil unitId dari subsubunit yang dipilih
    if (form.value.subsubunitId) {
      const selectedSubSubUnit = (subSubUnitData.value as any[]).find((item: any) => item.id === form.value.subsubunitId)
      if (selectedSubSubUnit && selectedSubSubUnit.subunit?.unit?.id) {
        unitId = Number(selectedSubSubUnit.subunit.unit.id)
      }
    }

    // Jika unitId tidak ditemukan dari subsubunit, gunakan globalUnitCode
    if (!unitId && globalUnitCode.value) {
      unitId = Number(globalUnitCode.value)
      console.log('Using global unit code as fallback:', unitId)
    }

    const tanggal = form.value.tanggal_kontrak
    if (!unitId) {
      showSnackbar('Sub sub unit belum dipilih atau unit tidak ditemukan', 'error')
      return
    }
    if (!tanggal) {
      showSnackbar('Tanggal kontrak wajib diisi', 'error')
      return
    }
    const { generate, data, error, loading } = useGenerateNomorDokumen()
    await generate({ jenisNomorId, unitId, tanggal })
    if (data.value && (data.value as any)?.nomorLengkap) {
      form.value.nomor_kontrak = (data.value as any).nomorLengkap
      showSnackbar('Nomor Kontrak berhasil digenerate', 'success')
    } else {
      showSnackbar('Gagal generate nomor Kontrak', 'error')
    }
  } catch (e: any) {
    showSnackbar(e.message || 'Gagal generate nomor Kontrak', 'error')
  }
}

const handleGenerateNomorSPPBJ = async () => {
  try {
    const jenisNomorId = 2
    let unitId: number | null = null

    // Coba ambil unitId dari subsubunit yang dipilih
    if (form.value.subsubunitId) {
      const selectedSubSubUnit = (subSubUnitData.value as any[]).find((item: any) => item.id === form.value.subsubunitId)
      if (selectedSubSubUnit && selectedSubSubUnit.subunit?.unit?.id) {
        unitId = Number(selectedSubSubUnit.subunit.unit.id)
      }
    }

    // Jika unitId tidak ditemukan dari subsubunit, gunakan globalUnitCode
    if (!unitId && globalUnitCode.value) {
      unitId = Number(globalUnitCode.value)
      console.log('Using global unit code as fallback for SPPBJ:', unitId)
    }

    const tanggal = form.value.tanggal_sppbj
    if (!unitId) {
      showSnackbar('Sub sub unit belum dipilih atau unit tidak ditemukan', 'error')
      return
    }
    if (!tanggal) {
      showSnackbar('Tanggal SPPBJ wajib diisi', 'error')
      return
    }

    const { generate, data, error, loading } = useGenerateNomorDokumen()
    await generate({ jenisNomorId, unitId, tanggal })
    if (data.value && (data.value as any)?.nomorLengkap) {
      form.value.nomor_sppbj = (data.value as any).nomorLengkap
      showSnackbar('Nomor SPPBJ berhasil digenerate', 'success')
    } else {
      showSnackbar('Gagal generate nomor SPPBJ', 'error')
    }
  } catch (e: any) {
    showSnackbar(e.message || 'Gagal generate nomor SPPBJ', 'error')
  }
}
const handleGenerateNomorSPMK = async () => {
  try {
    const jenisNomorId = 3
    let unitId: number | null = null

    // Coba ambil unitId dari subsubunit yang dipilih
    if (form.value.subsubunitId) {
      const selectedSubSubUnit = (subSubUnitData.value as any[]).find((item: any) => item.id === form.value.subsubunitId)
      if (selectedSubSubUnit && selectedSubSubUnit.subunit?.unit?.id) {
        unitId = Number(selectedSubSubUnit.subunit.unit.id)
      }
    }

    // Jika unitId tidak ditemukan dari subsubunit, gunakan globalUnitCode
    if (!unitId && globalUnitCode.value) {
      unitId = Number(globalUnitCode.value)
      console.log('Using global unit code as fallback for SPMK:', unitId)
    }

    const tanggal = form.value.tanggal_spmk
    if (!unitId) {
      showSnackbar('Sub sub unit belum dipilih atau unit tidak ditemukan', 'error')
      return
    }
    if (!tanggal) {
      showSnackbar('Tanggal SPMK wajib diisi', 'error')
      return
    }
    const { generate, data, error, loading } = useGenerateNomorDokumen()
    await generate({ jenisNomorId, unitId, tanggal })
    if (data.value && (data.value as any)?.nomorLengkap) {
      form.value.nomor_spmk = (data.value as any).nomorLengkap
      showSnackbar('Nomor SPMK berhasil digenerate', 'success')
    } else {
      showSnackbar('Gagal generate nomor SPMK', 'error')
    }
  } catch (e: any) {
    showSnackbar(e.message || 'Gagal generate nomor SPMK', 'error')
  }
}
</script>

<template>
  <VCard :title="mode === 'edit' ? 'Edit Kontrak' : 'Tambah Kontrak'">
    <VCardText>
      <VRow v-if="paketPengadaanDataAdd" class="mb-6 px-10">
        <VCol cols="12">
          <div class="text-h6 mb-4 d-flex align-center ">
            Data Paket
          </div>
          <VDivider class="mb-4" />
        </VCol>

        <VCol cols="12" class="pb-2 ">
          <VRow no-gutters>
            <VCol cols="12" md="3" class="d-flex align-items-center">
              <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                Nama Paket Pengadaan
              </label>
            </VCol>
            <VCol cols="12" md="9">
              <div class="text-body-1">
                {{ paketPengadaanDataAdd.nama_paket || '-' }}
              </div>
            </VCol>
          </VRow>
        </VCol>

        <VCol cols="12" class="pb-2 ">
          <VRow no-gutters>
            <VCol cols="12" md="3" class="d-flex align-items-center">
              <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                Pagu
              </label>
            </VCol>
            <VCol cols="12" md="9">
              <div class="text-body-1 font-weight-medium text-info">
                {{ paketPengadaanDataAdd.pagu_anggaran ?
                  formatCurrency(paketPengadaanDataAdd.pagu_anggaran) :
                  '-' }}
              </div>
            </VCol>
          </VRow>
        </VCol>

        <VCol cols="12" class="pb-2 ">
          <VRow no-gutters>
            <VCol cols="12" md="3" class="d-flex align-items-center">
              <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                Kategori Pengadaan
              </label>
            </VCol>
            <VCol cols="12" md="9">
              <div class="text-body-1">
                {{ paketPengadaanDataAdd.kategori_pengadaan || '-' }}
              </div>
            </VCol>
          </VRow>
        </VCol>

        <VCol cols="12" class="pb-2 ">
          <VRow no-gutters>
            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
              <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                Jenis Pekerjaan
              </label>
            </VCol>
            <VCol cols="12" md="9">
              <div class="text-body-1">
                {{ paketPengadaanDataAdd.jenis_pengadaan || '-' }}
              </div>
            </VCol>
          </VRow>
        </VCol>

        <VCol cols="12" class="pb-2 ">
          <VRow no-gutters>
            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
              <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                Deskripsi Pekerjaan
              </label>
            </VCol>
            <VCol cols="12" md="9">
              <div class="text-body-1">
                {{ paketPengadaanDataAdd.spesifikasi_pekerjaan || '-' }}
              </div>
            </VCol>
          </VRow>
        </VCol>

        <VCol cols="12" class="pb-2 ">
          <VRow no-gutters>
            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
              <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                Metode Pemilihan
              </label>
            </VCol>
            <VCol cols="12" md="9">
              <div class="text-body-1">
                {{ paketPengadaanDataAdd.metode_pemilihan || '-' }}
              </div>
            </VCol>
          </VRow>
        </VCol>
      </VRow>

      <VCol cols="12" class="px-10">
        <div class="text-h6 mb-4 d-flex align-center">
          Data Kontrak
        </div>
        <VDivider class="mb-4" />
      </VCol>

      <VForm v-model="formValid" @submit.prevent="handleSubmit">
        <VRow class="px-10">
          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="subsubunitId">
                  Sub Sub Unit
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VAutocomplete id="subsubunitId" v-model="form.subsubunitId as any" return-object
                  :rules="formRules.subsubunitId" :loading="loading" :items="subSubUnitData || []"
                  item-title="nama_subsubunit" item-value="id" placeholder="Pilih sub sub unit" density="compact"
                  required v-model:search="searchSubSubUnitQuery">
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                      <VListItemSubtitle>
                        {{ (item.raw as any).subunit.nama_subunit }} - {{ (item.raw as any).subunit.unit.nama_unit }}
                      </VListItemSubtitle>
                    </VListItem>
                  </template>
                </VAutocomplete>

              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2" v-if="mode === 'edit'">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="paketPengadaanId">
                  Paket Pengadaan
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VAutocomplete id="paketPengadaanId" v-model="form.paketPengadaanId" return-object
                  :rules="formRules.paketPengadaanId" :loading="loading" :items="paketPengadaanData || []"
                  item-title="nama_paket" item-value="id" placeholder="Pilih paket pengadaan" density="compact">
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                    </VListItem>
                  </template>
                </VAutocomplete>
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="nilai_kontrak">
                  Nilai Kontrak
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="nilai_kontrak" v-model="formattedNilaiKontrak" :rules="formRules.nilai_kontrak"
                  :loading="loading" placeholder="Masukkan nilai kontrak" persistent-placeholder density="compact"
                  required />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="ppkId">
                  Nama PPK
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VAutocomplete id="ppkId" v-model="form.ppkId" return-object :rules="formRules.ppkId" :loading="loading"
                  :items="searchPpkQuery ? (ppkSearchData || []) : (ppkSearchData || [])" item-title="name"
                  item-value="id" placeholder="Pilih nama PPK" density="compact" required
                  v-model:search="searchPpkQuery">
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                      <VListItemSubtitle v-if="(item.raw as any).email">
                        {{ (item.raw as any).email }}
                        <span v-if="(item.raw as any).telepon"> - {{ (item.raw as any).telepon }}</span>
                      </VListItemSubtitle>
                    </VListItem>
                  </template>
                </VAutocomplete>
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="penyediaId">
                  Penyedia
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VAutocomplete id="penyediaId" v-model="form.penyediaId" return-object :rules="formRules.penyediaId"
                  :loading="loading" :items="searchPenyediaQuery ? (penyediaSearchData || []) : (penyediaData || [])"
                  item-title="nama_penyedia" item-value="id" placeholder="Pilih penyedia" density="compact" required
                  v-model:search="searchPenyediaQuery">
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                      <VListItemSubtitle v-if="(item.raw as any).alamat">
                        {{ (item.raw as any).alamat }}
                        <span v-if="(item.raw as any).no_telepon"> - {{ (item.raw as any).no_telepon }}</span>
                      </VListItemSubtitle>
                    </VListItem>
                  </template>
                </VAutocomplete>
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="tanggal_sppbj">
                  Tanggal SPPBJ
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="tanggal_sppbj" v-model="form.tanggal_sppbj" :rules="formRules.tanggal_sppbj"
                  :loading="loading" type="date" density="compact" required />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="nomor_sppbj">
                  Nomor SPPBJ
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VRow no-gutters>
                  <VCol cols="12" md="8">
                    <VTextField id="nomor_sppbj" v-model="form.nomor_sppbj" :rules="formRules.nomor_sppbj"
                      :loading="loading" placeholder="Masukkan nomor SPPBJ" persistent-placeholder density="compact"
                      required />
                  </VCol>
                  <VCol cols="12" md="4" class="pl-2">
                    <VBtn color="primary" variant="outlined" @click="handleGenerateNomorSPPBJ" :loading="loading"
                      density="compact" class="mt-1">
                      <VIcon start icon="bx-reset" />
                      Generate
                    </VBtn>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </VCol>

          <!-- <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="sumberDanaId">
                  Sumber Dana
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VAutocomplete id="sumberDanaId" v-model="form.sumberDanaId" :rules="formRules.sumberDanaId"
                  :loading="loading" :items="sumberDanaData || []" item-title="nama" item-value="id"
                  placeholder="Pilih sumber dana" density="compact" required :search-input.sync="searchPaketPengadaan">
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                    </VListItem>
                  </template>
                </VAutocomplete>
              </VCol>
            </VRow>
          </VCol> -->

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="tanggal_kontrak">
                  Tanggal Kontrak
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="tanggal_kontrak" v-model="form.tanggal_kontrak" :rules="formRules.tanggal_kontrak"
                  :loading="loading" type="date" density="compact" />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="nomor_kontrak">
                  Nomor Kontrak
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VRow no-gutters>
                  <VCol cols="12" md="8">
                    <VTextField id="nomor_kontrak" v-model="form.nomor_kontrak" :rules="formRules.nomor_kontrak"
                      :loading="loading" placeholder="Masukkan nomor kontrak" persistent-placeholder
                      density="compact" />
                  </VCol>
                  <VCol cols="12" md="4" class="pl-2">
                    <VBtn color="primary" variant="outlined" @click="handleGenerateNomorKontrak" :loading="loading"
                      density="compact" class="mt-1">
                      <VIcon start icon="bx-reset" />
                      Generate
                    </VBtn>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="jangka_waktu">
                  Jangka Waktu (hari)
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="jangka_waktu" v-model="form.jangka_waktu" :rules="formRules.jangka_waktu"
                  :loading="loading" placeholder="Masukkan jangka waktu dalam hari" persistent-placeholder
                  density="compact" type="number" required />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="tanggal_mulai">
                  Tanggal Mulai Pelaksanaan
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="tanggal_mulai" v-model="form.tanggal_mulai" :rules="formRules.tanggal_mulai"
                  :loading="loading" type="date" density="compact" />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="tanggal_selesai">
                  Tanggal Selesai Pelaksanaan
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="tanggal_selesai" v-model="form.tanggal_selesai" :rules="formRules.tanggal_selesai"
                  :loading="loading" type="date" density="compact" />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="tanggal_spmk">
                  Tanggal SPMK
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VTextField id="tanggal_spmk" v-model="form.tanggal_spmk" :rules="formRules.tanggal_spmk"
                  :loading="loading" type="date" density="compact" />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis" for="nomor_spmk">
                  Nomor SPMK
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VRow no-gutters>
                  <VCol cols="12" md="8">
                    <VTextField id="nomor_spmk" v-model="form.nomor_spmk" :rules="formRules.nomor_spmk"
                      :loading="loading" placeholder="Masukkan nomor SPMK" persistent-placeholder density="compact" />
                    <div class="text-caption text-medium-emphasis mt-1">
                      Opsional untuk konstruksi
                    </div>
                  </VCol>
                  <VCol cols="12" md="4" class="pl-2">
                    <VBtn color="primary" variant="outlined" @click="handleGenerateNomorSPMK" :loading="loading"
                      density="compact" class="mt-1">
                      <VIcon start icon="bx-reset" />
                      Generate
                    </VBtn>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </VCol>


          <VCol cols="12" class="pb-2">
            <VRow no-gutters>
              <VCol cols="12" md="3" class="d-flex align-items-center">
                <label class="v-label text-body-2 text-high-emphasis font-weight-medium" for="metode_pembayaran">
                  Metode Pembayaran
                </label>
              </VCol>
              <VCol cols="12" md="9">
                <VSelect id="metode_pembayaran" :items="['Lunas', 'Termin']" placeholder="Pilih metode pembayaran"
                  density="compact" />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12" class="pt-4">
            <VRow no-gutters>
              <VCol cols="12" md="3" />
              <VCol cols="12" md="9">
                <VBtn type="submit" color="primary" class="me-4" :disabled="!formValid || loading" :loading="loading"
                  @click="handleSubmit">
                  <VIcon start icon="bx-save" />
                  Simpan
                </VBtn>
                <VBtn color="secondary" variant="tonal" :disabled="loading" @click="handleCancel">
                  <VIcon start icon="mdi-close-circle" />
                  Batal
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
