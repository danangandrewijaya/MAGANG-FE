import type { FileToUpload, FileUploadResponse, UploadProgress } from '@/types/fileUpload'
import { ref } from 'vue'

export function useFileUpload() {
  const { $uploadFileToGraphQL } = useNuxtApp()
  const uploading = ref(false)
  const uploadProgress = ref<UploadProgress>({ uploaded: 0, total: 0, currentFile: '' })

  const validateFile = (file: File | null): string | null => {
    if (!file)
      return 'File tidak ditemukan'

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize)
      return 'Ukuran file terlalu besar. Maksimal 5MB'

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type))
      return 'Tipe file tidak didukung. Hanya JPG, PNG, dan PDF yang diizinkan'

    return null
  }

  const uploadFile = async (
    file: File,
    namaId: string,
    id: number,
    jenisDocument: number,
    namaDocument: string,
  ): Promise<FileUploadResponse | null> => {
    const validationError = validateFile(file)
    if (validationError) {
      showSnackbar(validationError, 'error')

      return null
    }

    uploading.value = true
    uploadProgress.value = { uploaded: 0, total: 1, currentFile: file.name }

    try {
      const result = await $uploadFileToGraphQL(file, {
        data: {
          file,
          [namaId]: Number.parseInt(id.toString()), // gunakan dynamic key dari string namaId
          nama_dokument: namaDocument,
          jenisDokumenId: jenisDocument,
        },
      })

      uploadProgress.value.uploaded = 1

      return result
    }
    catch (error: any) {
      // Ambil error dari graphQLErrors atau networkError.result.errors
      let errorMessage = error?.message || 'Gagal mengupload file.'
      let errorCode = null
      const networkErrors = error?.networkError?.result?.errors
      const gqlValidationError = networkErrors?.[0]

      if (gqlValidationError?.message)
        errorMessage = gqlValidationError.message

      if (gqlValidationError?.extensions?.code)
        errorCode = gqlValidationError.extensions.code
      else if (error?.networkError?.statusCode)
        errorCode = error.networkError.statusCode

      // Tangkap error 400 dari networkError jika tidak ada errors[0]
      if (!gqlValidationError && error?.networkError?.message) {
        errorMessage = error.networkError.message
        errorCode = error?.networkError?.statusCode || 'BAD_REQUEST'
      }

      // Jika error validasi GraphQL, tampilkan error dan return null
      if (errorCode === 'GRAPHQL_VALIDATION_FAILED') {
        showSnackbar(errorMessage, 'error', 5000)

        return null
      }

      console.error('Upload error:', error)
      showSnackbar(`Error: ${errorMessage}`, 'error', 5000)

      return null
    }
    finally {
      uploading.value = false
    }
  }

  const uploadMultipleFiles = async (
    files: FileToUpload[],
    namaId: string,
    id: number,
  ): Promise<FileUploadResponse[]> => {
    if (!files || files.length === 0)
      return []

    uploading.value = true
    uploadProgress.value = { uploaded: 0, total: files.length, currentFile: '' }

    const results: FileUploadResponse[] = []

    for (const fileData of files) {
      uploadProgress.value.currentFile = fileData.file.name

      const result = await uploadFile(
        fileData.file,
        namaId,
        id,
        fileData.type,
        fileData.name,
      )

      // Jika gagal upload karena error validasi, hentikan proses upload berikutnya
      if (result === null) {
        uploading.value = false

        return results
      }

      results.push(result)
      uploadProgress.value.uploaded++
    }

    uploading.value = false

    return results
  }

  return {
    uploading: readonly(uploading),
    uploadProgress: readonly(uploadProgress),
    validateFile,
    uploadFile,
    uploadMultipleFiles,
  }
}
