export const sumberDanaQuery = {
  sumber_dana: {
    get: `query GetAllSumberDana {
      getAllSumberDana {
        id
        cuid
        kode
        nama
        is_active
        created_at
        updated_at
      }
    }`,
  },
}
