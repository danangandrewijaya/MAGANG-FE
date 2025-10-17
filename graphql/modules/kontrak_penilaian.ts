export const kontrakPenilaianQuery = {
  kontrak_penilaian: {
    get: `query GetKontrakPenilaianList {
      getKontrakPenilaianList {
        data {
          id
          cuid
          kontrakId
          penilaiId
          jenisPenilaian {
            id
            kode
            nama
          }
          nilai
          catatan
          rekomendasi
          tanggal_penilaian
          created_by
          created_at
          updated_by
          updated_at
        }
        total
      }
    }`,
    create: `mutation CreateKontrakPenilaian($data: CreateKontrakPenilaianInput!) {
      createKontrakPenilaian(data: $data) {
        id
        cuid
        kontrakId
        penilaiId
        jenisPenilaian {
          id
          kode
          nama
        }
        nilai
        catatan
        rekomendasi
        tanggal_penilaian
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    first: `query GetKontrakPenilaian($getKontrakPenilaianId: Int!) {
      getKontrakPenilaian(id: $getKontrakPenilaianId) {
        id
        cuid
        kontrakId
        penilaiId
        jenisPenilaian {
          id
          kode
          nama
        }
        nilai
        catatan
        rekomendasi
        tanggal_penilaian
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    update: `mutation UpdateKontrakPenilaian($data: UpdateKontrakPenilaianInput!, $updateKontrakPenilaianId: Int!) {
      updateKontrakPenilaian(data: $data, id: $updateKontrakPenilaianId) {
        id
        cuid
        kontrakId
        penilaiId
        jenisPenilaian {
          id
          kode
          nama
        }
        nilai
        catatan
        rekomendasi
        tanggal_penilaian
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    delete: `mutation DeleteKontrakPenilaian($deleteKontrakPenilaianId: Int!) {
      deleteKontrakPenilaian(id: $deleteKontrakPenilaianId)
    }`,
  }
}
