export const terminQuery = {
  termin: {
    get: `query GetAllTermin {
      getAllTermin {
        id
        uid
        nama
        kode
        keterangan
        created_by
        created_at
        updated_by
        updated_at
      }
    }`,
    first: `query GetTermin($getTerminId: Int!) {
      getTermin(id: $getTerminId) {
        id
        uid
        nama
        kode
        keterangan
      }
    }`,
    create: `mutation CreateTermin($data: CreateTerminInput!) {
      createTermin(data: $data) {
        id
        uid
        nama
        kode
        keterangan
      }
    }`,
    update: `mutation UpdateTermin($data: UpdateTerminInput!, $id: Int!) {
      updateTermin(data: $data, id: $id) {
        id
        uid
        nama
        kode
        keterangan
      }
    }`,
    delete: `mutation DeleteTermin($deleteTerminId: Int!) {
      deleteTermin(id: $deleteTerminId)
    }`,
  },
}
