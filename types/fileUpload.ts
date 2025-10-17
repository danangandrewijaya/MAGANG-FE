export interface FileUploadResponse {
  id: number
  uid: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number
}

export interface UploadProgress {
  uploaded: number
  total: number
  currentFile: string
}

export interface FileToUpload {
  file: File
  type: number
  name: string
}
