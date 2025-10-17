export const kontrakQuery = {
  kontrak: {
    get: `query GetListKontrak($limit: Int, $page: Int, $filter: KontrakFilterInput) {
      getListKontrak(limit: $limit, page: $page, filter: $filter) {
        data {
          id
          cuid
          nomor_kontrak
          tanggal_kontrak
          nilai_kontrak
          tanggal_mulai
          tanggal_selesai
          jangka_waktu
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
          paketPengadaan {
            id
            id_eprocplan
            cuid
            nama_paket
            kode_paket
            lokasi
            pagu_anggaran
            hps
            tanggal_mulai
            tanggal_selesai
            tahun_anggaran
            metode_pemilihan
            spesifikasi_pekerjaan
            jenis_pengadaan
            kategori_pengadaan
          }
          sumberDana {
            id
            cuid
            kode
            nama
          }
          subsubunit {
            id
            cuid
            kode_subsubunit
            nama_subsubunit
          }
          tanggal_sppbj
          tanggal_spmk
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
          }
          progress {
            id
            cuid
            deskripsi
            keterangan
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
        total
      }
    }`,
    create: `mutation CreateKontrak($data: CreateKontrakInput!) {
      createKontrak(data: $data) {
        id
        cuid
        nomor_kontrak
        tanggal_kontrak
        nilai_kontrak
        tanggal_mulai
        tanggal_selesai
        jangka_waktu
        tanggal_sppbj
        tanggal_spmk
        paketPengadaanId
        penyediaId
        sumberDanaId
      }
    }`,
    first: `query GetKontrak($getKontrakId: Int!) {
      getKontrak(id: $getKontrakId) {
        id
        cuid
        nomor_kontrak
        tanggal_kontrak
        nilai_kontrak
        tanggal_mulai
        tanggal_selesai
        jangka_waktu
        nomor_sppbj
        tanggal_sppbj
        tanggal_spmk
        nomor_spmk
        ppk {
          id
          email
          name
          telepon
          sso_identity
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
        paketPengadaan {
          id
          id_eprocplan
          cuid
          nama_paket
          kode_paket
          lokasi
          pagu_anggaran
          hps
          tanggal_mulai
          tanggal_selesai
          tahun_anggaran
          metode_pemilihan
          spesifikasi_pekerjaan
          jenis_pengadaan
          kategori_pengadaan
        }
        sumberDana {
          id
          cuid
          kode
          nama
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
        progress {
          id
          cuid
          jadwal_target
          target_persentase
          realisasi_persentase
          nomor_bapp
          deskripsi
          keterangan
          termin {
            id
            uid
            nama
            kode
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
        penilaian {
          id
          jenisPenilaian {
            id
            kode
            nama
          }
          nilai
        }
      }
    }`,
    update: `mutation UpdateKontrak($data: UpdateKontrakInput!, $updateKontrakId: Int!) {
      updateKontrak(data: $data, id: $updateKontrakId) {
        id
        cuid
        nomor_kontrak
        tanggal_kontrak
        nilai_kontrak
      }
    }`,
    delete: `mutation DeleteKontrak($deleteKontrakId: Int!) {
      deleteKontrak(id: $deleteKontrakId)
    }`,

  }
}
