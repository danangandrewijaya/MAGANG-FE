export const kontrakAdendumQuery = {
  kontrak_adendum: {
    get: `query GetListKontrakAdendum($limit: Int, $filter: KontrakAdendumFilterInput) {
      getListKontrakAdendum(limit: $limit, filter: $filter) {
        data {
          id
          cuid
          nomor_adendum
          tanggal_adendum
          perihal_adendum
          nilai_kontrak_baru
          tanggal_mulai_baru
          tanggal_selesai_baru
          keterangan
          created_at
          updated_at
          created_by
          updated_by
          kontrakId
          dokument {
            id
            uid
            nama_dokument
            file_path
            file_name
            file_type
            file_size
            tanggal_dokument
            nomor_dokument
            keterangan
            jenisDokumenId
            file_url
            documentUrl
          }
        }
        total
      }
    }`,
    first: `query GetKontrakAdendum($getKontrakAdendumId: Int!) {
      getKontrakAdendum(id: $getKontrakAdendumId) {
        id
        cuid
        nomor_adendum
        tanggal_adendum
        perihal_adendum
        nilai_kontrak_baru
        tanggal_mulai_baru
        tanggal_selesai_baru
        keterangan
        metode_pembayaran
        jangka_waktu
        created_at
        updated_at
        created_by
        updated_by
        kontrakId
        dokument {
          id
          uid
          nama_dokument
          file_path
          file_name
          file_type
          file_size
          tanggal_dokument
          nomor_dokument
          keterangan
          jenisDokumenId
          file_url
          documentUrl
        }
      }
    }`,
    create: `mutation CreateKontrakAdendum($data: CreateKontrakAdendumInput!) {
      createKontrakAdendum(data: $data) {
        id
        cuid
        nomor_adendum
        tanggal_adendum
        perihal_adendum
        nilai_kontrak_baru
        tanggal_mulai_baru
        tanggal_selesai_baru
        keterangan
        metode_pembayaran
        jangka_waktu
        created_at
        updated_at
        created_by
        updated_by
        kontrakId
      }
    }`,
    update: `mutation UpdateKontrakAdendum($data: UpdateKontrakAdendumInput!, $updateKontrakAdendumId: Int!) {
      updateKontrakAdendum(data: $data, id: $updateKontrakAdendumId) {
        id
        cuid
        nomor_adendum
        tanggal_adendum
        perihal_adendum
        nilai_kontrak_baru
        tanggal_mulai_baru
        tanggal_selesai_baru
        keterangan
        metode_pembayaran
        jangka_waktu
        created_at
        updated_at
        created_by
        updated_by
        kontrakId
      }
    }`,
    delete: `mutation DeleteKontrakAdendum($deleteKontrakAdendumId: Int!) {
      deleteKontrakAdendum(id: $deleteKontrakAdendumId)
    }`,

  }
}
