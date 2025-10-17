export const permissionQuery = {
  permission: {
    get: `query GetListPermission($descending: Boolean, $sortBy: String, $search: String, $skip: Int, $take: Int) {
      getListPermission(descending: $descending, sortBy: $sortBy, search: $search, skip: $skip, take: $take) {
        data {
          id
          resource
          action
          created_at
          updated_at
          any_flag
          own_flag
          # roles {
            
          # }
        }
        total
      }
    }`,
    first: '',
    create: '',
    update: `mutation Mutation {
      syncPermissions
    }`,
    delete: '',
  },
  permission_resolver: {
    get: `query GetListResolverPermission($filter: ResolverPermissionFilterInput, $limit: Int, $page: Int) {
      getListResolverPermission(filter: $filter, limit: $limit, page: $page) {
        data {
          id
          resolverName
          type
          group {
            id
            name
            description
          }
          description
          created_at
          updated_at
        }
        total
      }
    }`,
  },
}
