export const menuQuery = {
  menu: {
    get: `query GetMenuByAplikasi {
      getMenuByAplikasi {
        id
        created_at
        updated_at
        label
        icon
        to
        command
        url
        disabled
        target
        separator
        style
        class
        order
        children {
          id
          created_at
          updated_at
          label
          icon
          to
          command
          url
          disabled
          target
          separator
          style
          class
          order
          children {
            id
            created_at
            updated_at
            label
            icon
            to
            command
            url
            disabled
            target
            separator
            style
            class
            order
            # children {
              
            # }
          }
        }
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
  menu_by_role: {
    get: `query GetMenuByRole($roleName: String!) {
      getMenuByRole(roleName: $roleName) {
        id
        created_at
        updated_at
        label
        icon
        to
        command
        url
        disabled
        target
        separator
        style
        class
        parent_id
        order
        children {
          id
          created_at
          updated_at
          label
          icon
          to
          command
          url
          disabled
          target
          separator
          style
          class
          parent_id
          order
          children {
            id
            created_at
            updated_at
            label
            icon
            to
            command
            url
            disabled
            target
            separator
            style
            class
            parent_id
            order
          }
        }
      }
    }`,
  },
}
