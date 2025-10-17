export const kontrakVerifikasiQuery = {
  kontrak_verifikasi: {
    get: `query GetKontrakVerifikasiList {
      getKontrakVerifikasiList {
        data {
          id
          cuid
          verifikatorId
          jenisStatusKontrakId
          aksi
          catatan
          alasan
          created_by
          created_at
          updated_by
          updated_at
          jenisStatusKontrak {
            id
            cuid
            kode
            nama
            deskripsi
            urutan
            is_active
            is_final
            warna
            created_by
            created_at
            updated_by
            updated_at
          }
          kontrakPembayaran {
            id
            cuid
            nomor_pengajuan_pembayaran
            nilai_pembayaran
            tanggal_pengajuan_pembayaran
            denda
            keterangan
            created_by
            updated_by
            created_at
            updated_at
          }
          kontrakPembayaranId
        }
        total
      }
    }`,
    create: `mutation CreateKontrakVerifikasi($data: CreateKontrakVerifikasiInput!) {
      createKontrakVerifikasi(data: $data) {
        id
        cuid
        kontrakPembayaranId
        verifikatorId
        jenisStatusKontrakId
        aksi
        catatan
        alasan
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    first: `mutation CreateKontrakVerifikasi($data: CreateKontrakVerifikasiInput!) {
      createKontrakVerifikasi(data: $data) {
        id
        cuid
        kontrakPembayaranId
        verifikatorId
        jenisStatusKontrakId
        aksi
        catatan
        alasan
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    update: `mutation UpdateKontrakVerifikasi($data: UpdateKontrakVerifikasiInput!, $updateKontrakVerifikasiId: Int!) {
      updateKontrakVerifikasi(data: $data, id: $updateKontrakVerifikasiId) {
        id
        cuid
        kontrakPembayaranId
        verifikatorId
        jenisStatusKontrakId
        aksi
        catatan
        alasan
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    delete: `mutation DeleteKontrakVerifikasi($deleteKontrakVerifikasiId: Int!) {
      deleteKontrakVerifikasi(id: $deleteKontrakVerifikasiId)
    }`,
  }
}
