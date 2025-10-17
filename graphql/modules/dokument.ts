export const dokumentQuery = {
  dokument: {
    first: `query GetDokumentById($getDokumentByIdId: Int!) {
      getDokumentById(id: $getDokumentByIdId) {
        id
        uid
        jenisDokumen {
          id
          uid
          nama
          deskripsi
          kode
        }
        nama_dokument
        file_path
        file_name
        file_type
        file_size
        tanggal_dokument
        nomor_dokument
        keterangan
        created_by
        created_at
        updated_by
        updated_at
        file_url
        documentUrl
      }
    }`,
    create: `mutation CreateDokument($data: CreateDokumentInput!) {
      createDokument(data: $data) {
        id
        uid
        jenisDokumen {
          id
          uid
          nama
          deskripsi
          kode
        }
        nama_dokument
        file_path
        file_name
        file_type
        file_size
        tanggal_dokument
        nomor_dokument
        keterangan
        created_by
        created_at
        updated_by
        updated_at
        file_url
        documentUrl
      }
    }`,
    update: `mutation UpdateDokument($data: UpdateDokumentInput!, $updateDokumentId: Int!) {
      updateDokument(data: $data, id: $updateDokumentId) {
        id
        uid
        jenisDokumen {
          id
          uid
          nama
          deskripsi
          kode
        }
        nama_dokument
        file_path
        file_name
        file_type
        file_size
        tanggal_dokument
        nomor_dokument
        keterangan
        created_by
        created_at
        updated_by
        updated_at
        file_url
        documentUrl
      }
    }`,
    delete: `mutation DeleteDokument($deleteDokumentId: Int!) {
      deleteDokument(id: $deleteDokumentId)
    }`,
  },
  nomor_dokumen: {
    create: `mutation GenerateAndCreateNomorDokumen($jenisNomorId: Int!, $unitId: Int!, $tanggal: DateTime) {
      generateAndCreateNomorDokumen(jenisNomorId: $jenisNomorId, unitId: $unitId, tanggal: $tanggal) {
        id
        cuid
        tanggal
        nomorUrut
        nomorLengkap
        is_active
        created_at
        updated_at
        unit {
          id
          cuid
          kode_unit
          nama_unit
        }
        jenisNomor {
          id
          cuid
          kode
          nama
          deskripsi
        }
      }
    }`,
  },
}
