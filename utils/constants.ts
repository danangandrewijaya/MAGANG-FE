export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

export const DOKUMEN_NPWP_REKANAN_KODE = 'NPWP_REKANAN'
export const DOKUMEN_NPWP_REKANAN_ID = 1
export const DOKUMEN_REFERENSI_BANK_KODE = 'REFERENSI_BANK'
export const DOKUMEN_REFERENSI_BANK_ID = 2

// Contract document types
export const DOKUMEN_KONTRAK_ID = 3
export const DOKUMEN_SPPBJ_ID = 4
export const DOKUMEN_SPMK_ID = 5
export const DOKUMEN_DAFTAR_BARANG_ID = 6
export const DOKUMEN_LAINNYA_ID = 7

// Adendum document types
export const DOKUMEN_ADENDUM_KONTRAK_ID = 8
export const DOKUMEN_ADENDUM_DAFTAR_BARANG_ID = 9
export const DOKUMEN_ADENDUM_LAINNYA_ID = 10

// Progress document types
export const DOKUMEN_BAPP_ID = 11

// Payment document types
export const DOKUMEN_BAST_ID = 12
export const DOKUMEN_BAP_PEMBAYARAN_ID = 13

// ItemsPerPageOptions for pagination
export const ITEM_PER_PAGE_OPTIONS = [
  { title: '10', value: 10 },
  { title: '25', value: 25 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
  { title: 'All', value: -1 },
]

export const KUALITAS_DAN_KUANTITAS = 1
export const BIAYA = 2
export const WAKTU = 3
export const LAYANAN = 4

export const DRAFT = 1
export const APPROVE_PPK = 2
export const TOLAK_PPK = 3
