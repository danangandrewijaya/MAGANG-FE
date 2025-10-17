export const penyediaQuery = {
  penyedia: {
    get: `query GetListPenyedia($filter: PenyediaFilterInput, $limit: Int, $page: Int) {
      getListPenyedia(filter: $filter, limit: $limit, page: $page) {
        data {
          id
          cuid
          nama_penyedia
          alamat
          email
          no_telepon
          npwp
          nama_direktur
          keterangan
          is_tumbas
          created_at
          updated_at
          dokument {
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
            paketPengadaanId
            penyediaId
            kontrakId
            kontrakAdendumId
            kontrakProgressId
            kontrakPembayaranId
            jenisDokumenId
            file_url
            documentUrl
          }
        }
        total
      }
    }`,
    first: `query GetPenyedia($id: Int!) {
      getPenyedia(id: $id) {
        id
        cuid
        nama_penyedia
        alamat
        email
        no_telepon
        npwp
        nama_direktur
        keterangan
        is_tumbas
        created_at
        updated_at
        dokument {
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
      }
    }`,
    create: `mutation CreatePenyedia($data: CreatePenyediaInput!) {
      createPenyedia(data: $data) {
        id
        cuid
        nama_penyedia
        alamat
        email
        no_telepon
        npwp
        nama_direktur
        keterangan
        created_at
        updated_at
      }
    }`,
    update: `mutation UpdatePenyedia($data: UpdatePenyediaInput!, $updatePenyediaId: Int!) {
      updatePenyedia(data: $data, id: $updatePenyediaId) {
        id
        cuid
        nama_penyedia
        alamat
        email
        no_telepon
        npwp
        nama_direktur
        keterangan
        created_at
        updated_at
      }
    }`,
    delete: `mutation DeletePenyedia($deletePenyediaId: Int!) {
      deletePenyedia(id: $deletePenyediaId)
    }`,
  },
  penyedia_drm: {
    update: `mutation SyncPenyediaFromDRM {
      syncPenyediaFromDRM {
        success
        message
        stats {
          total
          created
          updated
          failed
        }
      }
    }`,
  },
}
