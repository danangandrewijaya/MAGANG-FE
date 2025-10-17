<script setup lang="ts">
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { useGqlQuery } from '@/composables/graphql/useGqlQuery'
import { useFileUpload } from '@/composables/useFileUpload'
import { DOKUMEN_DAFTAR_BARANG_ID, DOKUMEN_KONTRAK_ID, DOKUMEN_LAINNYA_ID, DOKUMEN_SPMK_ID, DOKUMEN_SPPBJ_ID } from '@/utils/constants'
import { onMounted, ref } from 'vue'

const route = useRoute()
const contractId = ref(Number(decryptId((route.params as any).id)))

// console.log('contractId', contractId.value)

// Query untuk mengambil data kontrak
const { data: contractData, refetch: fetchContract, loading } = useGqlQuery(
    'kontrak',
    'first',
    { getKontrakId: contractId.value },
)

const { execute: deleteKontrakAdendum } = useGqlMutation('kontrak_adendum', 'delete')
const { execute: deleteDokument } = useGqlMutation('dokument', 'delete')

// console.log('contractDataxxx', contractData.value)

const contract = ref<any>(null)

// File upload functionality
const { uploadFile, uploading: uploadLoading } = useFileUpload()
const loadingStates = ref({
    kontrak: false,
    sppbj: false,
    spmk: false,
    daftarBarang: false,
    dokumenLainnya: false,
})

const fileInputs = ref({
    kontrak: null as File | null,
    sppbj: null as File | null,
    spmk: null as File | null,
    daftarBarang: null as File | null,
    dokumenLainnya: null as File | null,
})

const handleFileChange = (files: File[] | null, type: 'kontrak' | 'sppbj' | 'spmk' | 'daftarBarang' | 'dokumenLainnya') => {
    // Get the first file if files array exists
    const file = files && files.length > 0 ? files[0] : null
    fileInputs.value[type] = file
}

const handleFileRemoveDialog = (jenisDokumenId: number) => {
    openDialog(
        'Hapus data?',
        'Apakah Anda yakin ingin menghapus data ini?',
        () => {
            handleFileRemove(jenisDokumenId)
        },
    )
}

// Handle file removal for existing documents
const handleFileRemove = async (jenisDokumenId: number) => {
    if (!contract.value?.dokument) return

    const documentToRemove = contract.value.dokument.find((d: any) => d.jenisDokumenId === jenisDokumenId)

    if (!documentToRemove) {
        showSnackbar('Dokumen tidak ditemukan', 'error')
        return
    }

    try {
        await deleteDokument({ deleteDokumentId: parseInt(documentToRemove.id) })
        showSnackbar('Dokumen berhasil dihapus', 'success')
        // Refresh data to update the UI
        await fetchData()
    } catch (error) {
        console.error('Error deleting document:', error)
        showSnackbar('Gagal menghapus dokumen', 'error')
    }
}

const handleUpload = async (type: 'kontrak' | 'sppbj' | 'spmk' | 'daftarBarang' | 'dokumenLainnya') => {
    if (!contract.value?.id || !fileInputs.value[type]) {
        showSnackbar('Pilih file terlebih dahulu', 'error')
        return
    }

    // Set loading state untuk jenis dokumen tertentu
    loadingStates.value[type] = true

    // Check if a document of this type already exists
    const existingDoc = contract.value.dokument?.find((d: any) => {
        const docTypeId = type === 'kontrak' ? DOKUMEN_KONTRAK_ID
            : type === 'sppbj' ? DOKUMEN_SPPBJ_ID
                : type === 'spmk' ? DOKUMEN_SPMK_ID
                    : type === 'daftarBarang' ? DOKUMEN_DAFTAR_BARANG_ID
                        : DOKUMEN_LAINNYA_ID
        return d.jenisDokumenId === docTypeId
    })

    if (existingDoc) {
        showSnackbar(`Dokumen ${type.toUpperCase()} sudah ada. Hapus dokumen yang ada terlebih dahulu.`, 'warning')
        loadingStates.value[type] = false
        return
    }

    const namaDokumen =
        type === 'kontrak' ? 'Dokumen Kontrak'
            : type === 'sppbj' ? 'SPPBJ'
                : type === 'spmk' ? 'SPMK'
                    : type === 'daftarBarang' ? 'Daftar Barang Sesuai SP'
                        : 'Dokumen Lainnya'

    const jenisDokumenId =
        type === 'kontrak' ? DOKUMEN_KONTRAK_ID
            : type === 'sppbj' ? DOKUMEN_SPPBJ_ID
                : type === 'spmk' ? DOKUMEN_SPMK_ID
                    : type === 'daftarBarang' ? DOKUMEN_DAFTAR_BARANG_ID
                        : DOKUMEN_LAINNYA_ID

    try {
        const result = await uploadFile(
            fileInputs.value[type]!,
            'kontrakId',
            contract.value.id,
            jenisDokumenId,
            namaDokumen,
        )

        if (result) {
            showSnackbar('Dokumen berhasil diupload', 'success')
            fileInputs.value[type] = null
            // Refresh data to show the new document
            await fetchData()
        }
    } catch (error) {
        console.error('Error uploading document:', error)
        showSnackbar('Gagal mengupload dokumen', 'error')
    } finally {
        // Reset loading state untuk jenis dokumen tertentu
        loadingStates.value[type] = false
    }
}

// Fungsi untuk fetch data
const fetchData = async () => {
    try {
        await fetchContract()
        console.log('Contract Fetch Result:', {
            data: contractData.value,
        })
        contract.value = contractData.value
    } catch (error) {
        console.error('Error loading contract data:', error)
        showSnackbar('Gagal memuat data kontrak', 'error')
    }
}

// Load data
onMounted(async () => {
    if (!contractId.value) {
        showSnackbar('ID kontrak tidak ditemukan', 'error')
        navigateTo('/kontrak')
        return
    }

    await fetchData()
})

const handleBack = () => {
    navigateTo('/kontrak')
}

const handleAddAdendum = () => {
    navigateTo(`/adendum/add?contractId=${encryptId(contractId.value)}`)
}

const handleEditAdendum = (id: number) => {
    navigateTo(`/adendum/edit/${encryptId(id)}?contractId=${encryptId(contractId.value)}`)
}

const handleDetailAdendum = (id: number) => {
    navigateTo(`/adendum/${encryptId(id)}?contractId=${encryptId(contractId.value)}`)
}

const handleDeleteAdendum = async (id: number) => {
    console.log('handleDeleteAdendum', id)

    try {
        const response = await deleteKontrakAdendum({ deleteKontrakAdendumId: Number(id) })

        if (response?.data?.deleteKontrakAdendum) {
            showSnackbar('Adendum kontrak berhasil dihapus', 'success')
            await fetchData()
        } else {
            throw new Error('Gagal menghapus adendum kontrak')
        }
    }
    catch (error) {
        console.error('Error deleting kontrak:', error)
    }
}

const handleDeleteConfirmDialog = (id: number) => {
    openDialog(
        'Hapus data?',
        'Apakah Anda yakin ingin menghapus data ini?',
        () => {
            handleDeleteAdendum(id)
        },
    )
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>

<template>
    <div>
        <!-- Contract Detail -->
        <VCard v-if="contract" class="overflow-visible">
            <div class="w-100 sticky-header overflow-hidden rounded-t">
                <div class="d-flex align-center gap-4 flex-wrap bg-background pa-6">
                    <VCardTitle>Detail Kontrak</VCardTitle>
                    <VSpacer />
                    <div>
                        <VBtn color="secondary" variant="tonal" @click="handleBack">
                            Kembali
                        </VBtn>
                    </div>
                </div>
            </div>
            <VCardText>
                <!-- Data Paket Pengadaan -->
                <VRow class="mb-6 px-10">
                    <VCol cols="12">
                        <div class="text-h6 mb-4 d-flex align-center">
                            Data Paket Pengadaan
                        </div>
                        <VDivider class="mb-4" />
                    </VCol>

                    <!-- Nama Paket -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nama Paket
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.paketPengadaan?.nama_paket || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Pagu Anggaran -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Pagu Anggaran
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium text-info">
                                    {{ contract.paketPengadaan?.pagu_anggaran ?
                                        formatCurrency(contract.paketPengadaan.pagu_anggaran) :
                                        '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Kategori -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Kategori Pengadaan
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.paketPengadaan?.kategori_pengadaan || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Jenis Pekerjaan -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Jenis Pekerjaan
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.paketPengadaan?.jenis_pengadaan || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Spesifikasi Pekerjaan -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Deskripsi Pekerjaan
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.paketPengadaan?.spesifikasi_pekerjaan || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Metode Pemilihan -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Metode Pemilihan
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.paketPengadaan?.metode_pemilihan || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                </VRow>

                <!-- Data Kontrak -->
                <VRow class="mb-6 px-10">
                    <VCol cols="12">
                        <div class="text-h6 mb-4 d-flex align-center">
                            Data Kontrak
                        </div>
                        <VDivider class="mb-4" />
                    </VCol>

                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Sub Sub Unit
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium">
                                    {{ contract.subsubunit?.kode_subsubunit || '-' }} - {{
                                        contract.subsubunit?.nama_subsubunit || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Sub Unit
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium">
                                    {{ contract.subsubunit?.subunit?.kode_subunit || '-' }} - {{
                                        contract.subsubunit?.subunit?.nama_subunit || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Unit
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium">
                                    {{ contract.subsubunit?.subunit?.unit?.kode_unit || '-' }} - {{
                                        contract.subsubunit?.subunit?.unit?.nama_unit || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nomor Kontrak
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium">
                                    {{ contract.nomor_kontrak || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Tanggal Kontrak -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Tanggal Kontrak
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ formatDate(contract.tanggal_kontrak) }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Nilai Kontrak -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nilai Kontrak
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium text-success">
                                    {{ contract.nilai_kontrak ? formatCurrency(contract.nilai_kontrak) : '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Nama PPK -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nama PPK
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.ppk?.name || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    NIP
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.ppk?.sso_identity || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Tanggal Mulai -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Tanggal Mulai
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ formatDate(contract.tanggal_mulai) }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Tanggal Selesai -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Tanggal Selesai
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ formatDate(contract.tanggal_selesai) }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Jangka Waktu -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Jangka Waktu
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.jangka_waktu ? `${contract.jangka_waktu} hari` : '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Tanggal SPPBJ -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Tanggal SPPBJ
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ formatDate(contract.tanggal_sppbj) }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Nomor SPPBJ -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nomor SPPBJ
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.nomor_sppbj || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Tanggal SPMK -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Tanggal SPMK
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ formatDate(contract.tanggal_spmk) }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Nomor SPMK -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nomor SPMK
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.nomor_spmk || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>

                <!-- Data Penyedia -->
                <VRow class="mb-6 px-10">
                    <VCol cols="12">
                        <div class="text-h6 mb-4 d-flex align-center">
                            Data Penyedia
                        </div>
                        <VDivider class="mb-4" />
                    </VCol>

                    <!-- Nama Penyedia -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nama Penyedia
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1 font-weight-medium">
                                    {{ contract.penyedia?.nama_penyedia || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Alamat -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Alamat
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.penyedia?.alamat || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Email -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Email
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.penyedia?.email || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- No Telepon -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    No Telepon
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.penyedia?.no_telepon || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- NPWP -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    NPWP
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.penyedia?.npwp || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Nama Direktur -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Nama Direktur
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.penyedia?.nama_direktur || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Keterangan -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters>
                            <VCol cols="12" md="3" class="d-flex align-items-start pt-2">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">
                                    Keterangan
                                </label>
                            </VCol>
                            <VCol cols="12" md="9">
                                <div class="text-body-1">
                                    {{ contract.penyedia?.keterangan || '-' }}
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>

                <!-- Dokumen -->
                <VRow class="mb-6 px-10">
                    <VCol cols="12">
                        <div class="text-h6 mb-4 d-flex align-center">
                            Dokumen Kontrak
                        </div>
                        <VDivider class="mb-4" />
                    </VCol>

                    <!-- Dokumen Kontrak (jenisDokumenId = 3) -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">Dokumen
                                    Kontrak</label>
                            </VCol>
                            <VCol cols="12" md="6">
                                <!-- Existing Document Preview -->
                                <div v-if="contract.dokument && contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_KONTRAK_ID).length > 0"
                                    class="mb-3 ml-2">
                                    <VRow
                                        v-for="dokumen in contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_KONTRAK_ID)"
                                        :key="dokumen.id">
                                        <VRow align="center">
                                            <VCol cols="12" md="12">
                                                <FilePreview :file="{
                                                    id: parseInt(dokumen.id),
                                                    uid: dokumen.uid,
                                                    file_path: dokumen.file_path,
                                                    file_name: dokumen.nama_dokument,
                                                    file_type: dokumen.file_type,
                                                    file_size: dokumen.file_size,
                                                    documentUrl: dokumen.documentUrl
                                                }" status="success"
                                                    @remove="handleFileRemoveDialog(DOKUMEN_KONTRAK_ID)" />
                                            </VCol>
                                        </VRow>
                                    </VRow>
                                </div>
                                <!-- File Input -->
                                <VFileInput
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_KONTRAK_ID)"
                                    :model-value="fileInputs.kontrak ? [fileInputs.kontrak] : []"
                                    placeholder="Pilih file dokumen kontrak" prepend-icon=""
                                    prepend-inner-icon="bx-upload" accept=".pdf,.jpg,.jpeg,.png" density="compact"
                                    show-size :multiple="false"
                                    @update:model-value="handleFileChange($event, 'kontrak')" />

                            </VCol>
                            <VCol cols="12" md="3">
                                <VBtn
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_KONTRAK_ID)"
                                    outlined @click="() => handleUpload('kontrak')" :loading="loadingStates.kontrak"
                                    size="small" class="ml-2">
                                    Tambah
                                </VBtn>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center"
                            v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_KONTRAK_ID)">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <div class="text-caption text-medium-emphasis mt-1">
                                    File yang diupload harus berformat PDF
                                </div>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <VBtn outlined color="secondary" size="small" class="mt-2">Template Dokumen Kontrak
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- SPPBJ (jenisDokumenId = 4) -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">SPPBJ</label>
                            </VCol>
                            <VCol cols="12" md="6">
                                <!-- Existing Document Preview -->
                                <div v-if="contract.dokument && contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_SPPBJ_ID).length > 0"
                                    class="mb-3 ml-2">
                                    <VRow
                                        v-for="dokumen in contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_SPPBJ_ID)"
                                        :key="dokumen.id">
                                        <VRow align="center">
                                            <VCol cols="12" md="12">
                                                <FilePreview :file="{
                                                    id: parseInt(dokumen.id),
                                                    uid: dokumen.uid,
                                                    file_path: dokumen.file_path,
                                                    file_name: dokumen.nama_dokument,
                                                    file_type: dokumen.file_type,
                                                    file_size: dokumen.file_size,
                                                    documentUrl: dokumen.documentUrl
                                                }" status="success"
                                                    @remove="handleFileRemoveDialog(DOKUMEN_SPPBJ_ID)" />
                                            </VCol>
                                        </VRow>
                                    </VRow>
                                </div>
                                <!-- File Input -->
                                <VFileInput
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_SPPBJ_ID)"
                                    :model-value="fileInputs.sppbj ? [fileInputs.sppbj] : []"
                                    placeholder="Pilih file SPPBJ" prepend-icon="" prepend-inner-icon="bx-upload"
                                    accept=".pdf,.jpg,.jpeg,.png" density="compact" show-size :multiple="false"
                                    @update:model-value="handleFileChange($event, 'sppbj')" />
                            </VCol>
                            <VCol cols="12" md="3">
                                <VBtn
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_SPPBJ_ID)"
                                    outlined @click="() => handleUpload('sppbj')" :loading="loadingStates.sppbj"
                                    size="small" class="ml-2">
                                    Tambah
                                </VBtn>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center"
                            v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_SPPBJ_ID)">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <div class="text-caption text-medium-emphasis mt-1">
                                    File yang diupload harus berformat PDF
                                </div>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <VBtn outlined color="secondary" size="small" class="mt-2">Template SPPBJ</VBtn>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- SPMK (jenisDokumenId = 5) -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">SPMK</label>
                            </VCol>
                            <VCol cols="12" md="6">
                                <!-- Existing Document Preview -->
                                <div v-if="contract.dokument && contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_SPMK_ID).length > 0"
                                    class="mb-3 ml-2">
                                    <VRow
                                        v-for="dokumen in contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_SPMK_ID)"
                                        :key="dokumen.id">
                                        <VRow align="center">
                                            <VCol cols="12" md="12">
                                                <FilePreview :file="{
                                                    id: parseInt(dokumen.id),
                                                    uid: dokumen.uid,
                                                    file_path: dokumen.file_path,
                                                    file_name: dokumen.nama_dokument,
                                                    file_type: dokumen.file_type,
                                                    file_size: dokumen.file_size,
                                                    documentUrl: dokumen.documentUrl
                                                }" status="success"
                                                    @remove="handleFileRemoveDialog(DOKUMEN_SPMK_ID)" />
                                            </VCol>
                                        </VRow>
                                    </VRow>
                                </div>
                                <!-- File Input -->
                                <VFileInput
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_SPMK_ID)"
                                    :model-value="fileInputs.spmk ? [fileInputs.spmk] : []"
                                    placeholder="Pilih file SPMK" prepend-icon="" prepend-inner-icon="bx-upload"
                                    accept=".pdf,.jpg,.jpeg,.png" density="compact" show-size :multiple="false"
                                    @update:model-value="handleFileChange($event, 'spmk')" />
                            </VCol>
                            <VCol cols="12" md="3">
                                <VBtn
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_SPMK_ID)"
                                    outlined @click="() => handleUpload('spmk')" :loading="loadingStates.spmk"
                                    size="small" class="ml-2">
                                    Tambah
                                </VBtn>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center"
                            v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_SPMK_ID)">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <div class="text-caption text-medium-emphasis mt-1">
                                    File yang diupload harus berformat PDF
                                </div>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <VBtn outlined color="secondary" size="small" class="mt-2">Template SPMK</VBtn>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Daftar Barang Sesuai SP (jenisDokumenId = 6) -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">Daftar Barang
                                    Sesuai SP</label>
                            </VCol>
                            <VCol cols="12" md="6">
                                <!-- Existing Document Preview -->
                                <div v-if="contract.dokument && contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_DAFTAR_BARANG_ID).length > 0"
                                    class="mb-3 ml-2">
                                    <VRow
                                        v-for="dokumen in contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_DAFTAR_BARANG_ID)"
                                        :key="dokumen.id">
                                        <VRow align="center">
                                            <VCol cols="12" md="12">
                                                <FilePreview :file="{
                                                    id: parseInt(dokumen.id),
                                                    uid: dokumen.uid,
                                                    file_path: dokumen.file_path,
                                                    file_name: dokumen.nama_dokument,
                                                    file_type: dokumen.file_type,
                                                    file_size: dokumen.file_size,
                                                    documentUrl: dokumen.documentUrl
                                                }" status="success"
                                                    @remove="handleFileRemoveDialog(DOKUMEN_DAFTAR_BARANG_ID)" />
                                            </VCol>
                                        </VRow>
                                    </VRow>
                                </div>
                                <!-- File Input -->
                                <VFileInput
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_DAFTAR_BARANG_ID)"
                                    :model-value="fileInputs.daftarBarang ? [fileInputs.daftarBarang] : []"
                                    placeholder="Pilih file Daftar Barang Sesuai SP" prepend-icon=""
                                    prepend-inner-icon="bx-upload" accept=".pdf,.jpg,.jpeg,.png" density="compact"
                                    show-size :multiple="false"
                                    @update:model-value="handleFileChange($event, 'daftarBarang')" />
                            </VCol>
                            <VCol cols="12" md="3">
                                <VBtn
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_DAFTAR_BARANG_ID)"
                                    outlined @click="() => handleUpload('daftarBarang')"
                                    :loading="loadingStates.daftarBarang" size="small" class="ml-2">
                                    Tambah
                                </VBtn>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center"
                            v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_DAFTAR_BARANG_ID)">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <div class="text-caption text-medium-emphasis mt-1">
                                    File yang diupload harus berformat PDF
                                </div>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <VBtn outlined color="secondary" size="small" class="mt-2">Template Daftar Barang Sesuai
                                    SP</VBtn>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- Dokumen Lainnya (jenisDokumenId = 7) -->
                    <VCol cols="12" class="pb-2">
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                                <label class="v-label text-body-2 text-high-emphasis font-weight-medium">Dokumen
                                    Lainnya</label>
                            </VCol>
                            <VCol cols="12" md="6">
                                <!-- Existing Document Preview -->
                                <div v-if="contract.dokument && contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_LAINNYA_ID).length > 0"
                                    class="mb-3 ml-2">
                                    <VRow
                                        v-for="dokumen in contract.dokument.filter((d: any) => d.jenisDokumenId === DOKUMEN_LAINNYA_ID)"
                                        :key="dokumen.id">
                                        <VRow align="center">
                                            <VCol cols="12" md="12">
                                                <FilePreview :file="{
                                                    id: parseInt(dokumen.id),
                                                    uid: dokumen.uid,
                                                    file_path: dokumen.file_path,
                                                    file_name: dokumen.nama_dokument,
                                                    file_type: dokumen.file_type,
                                                    file_size: dokumen.file_size,
                                                    documentUrl: dokumen.documentUrl
                                                }" status="success"
                                                    @remove="handleFileRemoveDialog(DOKUMEN_LAINNYA_ID)" />
                                            </VCol>
                                        </VRow>
                                    </VRow>
                                </div>
                                <!-- File Input -->
                                <VFileInput
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_LAINNYA_ID)"
                                    :model-value="fileInputs.dokumenLainnya ? [fileInputs.dokumenLainnya] : []"
                                    placeholder="Pilih file Dokumen Lainnya" prepend-icon=""
                                    prepend-inner-icon="bx-upload" accept=".pdf,.jpg,.jpeg,.png" density="compact"
                                    show-size :multiple="false"
                                    @update:model-value="handleFileChange($event, 'dokumenLainnya')" />
                            </VCol>
                            <VCol cols="12" md="3">
                                <VBtn
                                    v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_LAINNYA_ID)"
                                    outlined @click="() => handleUpload('dokumenLainnya')"
                                    :loading="loadingStates.dokumenLainnya" size="small" class="ml-2">
                                    Tambah
                                </VBtn>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <div v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_LAINNYA_ID)"
                                    class="text-caption text-medium-emphasis mt-1">
                                    File yang diupload harus berformat PDF
                                </div>
                            </VCol>
                        </VRow>
                        <VRow no-gutters align="center"
                            v-if="!contract.dokument || !contract.dokument.find((d: any) => d.jenisDokumenId === DOKUMEN_LAINNYA_ID)">
                            <VCol cols="12" md="3">
                            </VCol>
                            <VCol cols="12" md="6" class="d-flex justify-start">
                                <VBtn outlined color="secondary" size="small" class="mt-2">Template Dokumen Lainnya
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>

                <!-- Adendum Kontrak -->
                <VRow class="mb-6 px-10">
                    <VCol cols="12">
                        <div class="text-h6 mb-4 d-flex align-center">
                            Adendum Kontrak
                            <VSpacer />
                            <VBtn outlined @click="() => handleAddAdendum()" color="primary" class="ml-4">Tambah</VBtn>
                        </div>
                        <VDivider class="mb-4" />
                        <VTable class="mb-4">
                            <thead>
                                <tr>
                                    <th>Tanggal Adendum</th>
                                    <th>Nomor Adendum</th>
                                    <th>Nilai Kontrak Adendum</th>
                                    <th>Tanggal Selesai Pelaksanaan</th>
                                    <th>Jangka Waktu</th>
                                    <th>Metode Pembayaran</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, idx) in contract.adendum" :key="idx">
                                    <td>{{ formatDate(item.tanggal_adendum) }}</td>
                                    <td>{{ item.nomor_adendum }}</td>
                                    <td>{{ formatCurrency(item.nilai_kontrak_baru) }}</td>
                                    <td>{{ formatDate(item.tanggal_selesai_baru) }}</td>
                                    <td>{{ item.jangka_waktu }}</td>
                                    <td>{{ item.metode_pembayaran }}</td>
                                    <td>
                                        <VBtn icon @click="() => handleDetailAdendum(item.id)" size="small" color="info"
                                            variant="text">
                                            <VIcon>bx-show</VIcon>
                                        </VBtn>
                                        <VBtn icon @click="() => handleEditAdendum(item.id)" size="small"
                                            color="primary" variant="text">
                                            <VIcon>bx-edit</VIcon>
                                        </VBtn>
                                        <VBtn icon @click="() => handleDeleteConfirmDialog(item.id)" size="small"
                                            color="error" variant="text">
                                            <VIcon>bx-trash</VIcon>
                                        </VBtn>
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>

        <!-- Error State -->
        <VCard v-else>
            <VCardText class="text-center py-8">
                <VIcon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
                <div class="text-h6 mb-2">Data Tidak Ditemukan</div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                    Kontrak yang Anda cari tidak ditemukan atau telah dihapus.
                </div>
                <VBtn color="primary" @click="handleBack">
                    <VIcon start icon="mdi-arrow-left" />
                    Kembali ke Daftar
                </VBtn>
            </VCardText>
        </VCard>
    </div>
</template>

<style scoped>
.v-label {
    line-height: 1.5;
}
</style>
