export const kontrakProgressQuery = {
  kontrak_progress: {
    get: `query GetListKontrakProgress($limit: Int, $page: Int, $filter: KontrakProgressFilterInput) {
      getListKontrakProgress(limit: $limit, page: $page, filter: $filter) {
        data {
          id
          cuid
          jadwal_target
          target_persentase
          realisasi_persentase
          nomor_bapp
          is_bast
          nomor_bast
          tanggal_bast
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
          termin {
            id
            uid
            nama
            kode
          }
          deskripsi
          keterangan
          created_at
          updated_at
          created_by
          updated_by
          kontrakId
          pembayaran {
            id
            cuid
            nilai_pembayaran
            tanggal_pengajuan_pembayaran
            denda
            keterangan
          }
        }
        meta {
          total
          page
          limit
          totalPages
        }
      }
    }`,
    first: `query GetKontrakProgress($getKontrakProgressId: Int!) {
      getKontrakProgress(id: $getKontrakProgressId) {
        id
        cuid
        jadwal_target
        target_persentase
        realisasi_persentase
        tanggal_bapp
        nomor_bapp
        is_bast
        nomor_bast
        tanggal_bast
        deskripsi
        keterangan
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
            pagu_anggaran
            kategori_pengadaan
            jenis_pengadaan
            spesifikasi_pekerjaan
          }
          penyedia {
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
          }
          subsubunit {
            id
            nama_subsubunit
            kode_subsubunit
            subunit {
              id
              kode_subunit
              nama_subunit
              unit {
                id
                kode_unit
                nama_unit
              }
            }
          }
          ppk {
            id
            email
            name
            telepon
            sso_identity
          }
          adendum {
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
          }
        }
        termin {
          id
          uid
          nama
          kode
        }
        pembayaran {
          id
          cuid
          nilai_pembayaran
          nomor_pengajuan_pembayaran
          tanggal_pengajuan_pembayaran
          denda
          keterangan
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
    create: `mutation CreateKontrakProgress($data: CreateKontrakProgressInput!) {
      createKontrakProgress(data: $data) {
        id
        cuid
        jadwal_target
        target_persentase
        realisasi_persentase
        nomor_bapp
        is_bast
        nomor_bast
        tanggal_bast
        deskripsi
        keterangan
        created_at
        updated_at
        created_by
        updated_by
        kontrakId
      }
    }`,
    update: `mutation UpdateKontrakProgress($data: UpdateKontrakProgressInput!, $updateKontrakProgressId: Int!) {
      updateKontrakProgress(data: $data, id: $updateKontrakProgressId) {
        id
        cuid
        jadwal_target
        target_persentase
        realisasi_persentase
        nomor_bapp
        tanggal_bapp
        is_bast
        nomor_bast
        tanggal_bast
        deskripsi
        keterangan
        created_at
        updated_at
        created_by
        updated_by
        kontrakId
        terminId
      }
    }`,
    delete: `mutation DeleteKontrakProgress($deleteKontrakProgressId: Int!) {
      deleteKontrakProgress(id: $deleteKontrakProgressId)
    }`,

  }
}
