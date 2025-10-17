export const kontrakPembayaranQuery = {
  kontrak_pembayaran: {
    get: `query GetListKontrakPembayaran($filter: KontrakPembayaranFilterInput) {
      getListKontrakPembayaran(filter: $filter) {
        data {
          id
          cuid
          nilai_pembayaran
          tanggal_pengajuan_pembayaran
          nomor_pengajuan_pembayaran
          denda
          keterangan
          progress {
            id
            cuid
            jadwal_target
            target_persentase
            realisasi_persentase
            nomor_bapp
            is_bast
            nomor_bast
            deskripsi
            termin {
              id
              uid
              nama
              kode
            }
            kontrak {
              id
              cuid
              nomor_kontrak
              tanggal_kontrak
              judul_kontrak
              ruang_lingkup
              nilai_kontrak
              tanggal_mulai
              tanggal_selesai
              jangka_waktu
              tanggal_sppbj
              tanggal_spmk
              paketPengadaan {
                nama_paket
                metode_pemilihan
              }
            }
          }
          verifikasi {
            id
            aksi
          }
        }
        total
      }
    }`,
    first: `query GetKontrakPembayaran($getKontrakPembayaranId: Int!) {
      getKontrakPembayaran(id: $getKontrakPembayaranId) {
        id
        cuid
        nilai_pembayaran
        tanggal_pengajuan_pembayaran
        nomor_pengajuan_pembayaran
        denda
        keterangan
        verifikasi {
          id
          aksi
        }
        progress {
          id
          cuid
          jadwal_target
          target_persentase
          realisasi_persentase
          nomor_bapp
          is_bast
          nomor_bast
          deskripsi
          termin {
            nama
          }
          kontrak {
            id
            cuid
            nomor_kontrak
            tanggal_kontrak
            judul_kontrak
            ruang_lingkup
            nilai_kontrak
            tanggal_mulai
            tanggal_selesai
            jangka_waktu
            tanggal_sppbj
            tanggal_spmk
            paketPengadaan {
              nama_paket
              metode_pemilihan
            }
          }
        }
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
    create: `mutation CreateKontrakPembayaran($data: CreateKontrakPembayaranInput!) {
      createKontrakPembayaran(data: $data) {
        id
        cuid
        nilai_pembayaran
        tanggal_pengajuan_pembayaran
        nomor_pengajuan_pembayaran
        denda
        keterangan
        created_by
        updated_by
        created_at
        updated_at
      }
    }`,
    update: `mutation UpdateKontrakPembayaran($data: UpdateKontrakPembayaranInput!, $updateKontrakPembayaranId: Int!) {
      updateKontrakPembayaran(data: $data, id: $updateKontrakPembayaranId) {
        id
        cuid
        nilai_pembayaran
        tanggal_pengajuan_pembayaran
        nomor_pengajuan_pembayaran
        denda
        keterangan
      }
    }`,
    delete: `mutation DeleteKontrakPembayaran($deleteKontrakPembayaranId: Int!) {
      deleteKontrakPembayaran(id: $deleteKontrakPembayaranId)
    }`,
  }
}
