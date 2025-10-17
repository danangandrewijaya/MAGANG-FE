export const subSubUnitQuery = {
  sub_sub_unit: {
    get: `query GetListSubSubUnit($search: String, $limit: Int, $idUnit: Int) {
      getListSubSubUnit(search: $search, limit: $limit, id_unit: $idUnit) {
        data {
          id
          subunit {
            id
            cuid
            kode_subunit
            nama_subunit
            is_active
            created_at
            updated_at
            unit {
              id
              cuid
              kode_unit
              nama_unit
              is_active
              created_at
              updated_at
            }
          }
          cuid
          kode_subsubunit
          nama_subsubunit
          is_active
          created_at
          updated_at
        }
        total
      }
    }`,
    first: `query GetSubSubUnitById($getSubSubUnitByIdId: Float!) {
      getSubSubUnitById(id: $getSubSubUnitByIdId) {
        id
        subunit {
          id
          unit {
            id
            cuid
            kode_unit
            nama_unit
          }
          cuid
          kode_subunit
          nama_subunit
        }
        cuid
        kode_subsubunit
        nama_subsubunit
      }
    }`
  },
}
