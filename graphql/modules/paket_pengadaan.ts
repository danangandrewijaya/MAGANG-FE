export const paketPengadaanQuery = {
  paket_pengadaan: {
    get: `query GetListPaketPengadaan($limit: Int, $page: Int, $filter: PaketPengadaanFilterInput) {
      getListPaketPengadaan(limit: $limit, page: $page, filter: $filter) {
        data {
          id
          id_eprocplan
          cuid
          nama_paket
          kode_paket
          lokasi
          ruang_lingkup_pengadaan
          spesifikasi_pekerjaan
          mak
          pagu_anggaran
          hps
          kategori_pengadaan
          jenis_pengadaan
          metode_pemilihan
          tanggal_mulai
          tanggal_selesai
          jadwal_mulai_pemilihan_penyedia
          jadwal_selesai_pemilihan_penyedia
          jadwal_mulai_pelaksanaan_kontrak
          jadwal_selesai_pelaksanaan_kontrak
          tahun_anggaran
          id_draft_proposal
          id_paket
          id_proposal_urp
        }
        total
      }
    }`,
    first: `query GetPaketPengadaan($getPaketPengadaanId: Int!) {
      getPaketPengadaan(id: $getPaketPengadaanId) {
        id
        id_eprocplan
        cuid
        nama_paket
        kode_paket
        lokasi
        ruang_lingkup_pengadaan
        spesifikasi_pekerjaan
        mak
        pagu_anggaran
        hps
        kategori_pengadaan
        jenis_pengadaan
        metode_pemilihan
        tanggal_mulai
        tanggal_selesai
        jadwal_mulai_pemilihan_penyedia
        jadwal_selesai_pemilihan_penyedia
        jadwal_mulai_pelaksanaan_kontrak
        jadwal_selesai_pelaksanaan_kontrak
        tahun_anggaran
        id_draft_proposal
        id_paket
        id_proposal_urp
        sumberDanaId
        unit {
          id
          kode_unit
          nama_unit
        }
      }
    }`,
    update: `mutation UpdatePaketPengadaan($data: UpdatePaketPengadaanInput!, $updatePaketPengadaanId: Int!) {
      updatePaketPengadaan(data: $data, id: $updatePaketPengadaanId) {
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
        is_active
        created_at
        updated_at
      }
    }`,
    delete: `mutation DeletePaketPengadaan($deletePaketPengadaanId: Int!) {
      deletePaketPengadaan(id: $deletePaketPengadaanId)
    }`,
  },
}
