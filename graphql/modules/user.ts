export const userQuery = {
  me: {
    first: `query Me {
      me {
        id
        email
        name
        telepon
        sso_identity
        userRole {
          id
          model_id
          role {
            id
            name
            code
            is_scoped
            scope_model
            is_active
          }
          scopedModel {
            scope_string
            unit {
              id
              cuid
              kode_unit
              nama_unit
              is_active
              created_at
              updated_at
            }
            subUnit {
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
            subSubUnit {
              id
              cuid
              kode_subsubunit
              nama_subsubunit
              is_active
              created_at
              updated_at
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
            }
          }
        }
      }
    }`,
  },
  sign_in: {
    upsert: 'mutation signIn($data: SignInInput!) { signIn(data: $data) { token } }',
  },
  select_role: {
    upsert: `mutation SelectRole($data: SelectRoleInput!) {
      selectRole(data: $data) {
        token
      }
    }`,
  },
  role: {
    get: `query GetListRole($descending: Boolean, $sortBy: String, $search: String, $skip: Int, $take: Int) {
      getListRole(descending: $descending, sortBy: $sortBy, search: $search, skip: $skip, take: $take) {
        data {
          id
          name
          code
          is_scoped
          scope_model
        }
        total
      }
    }`,
    create: `mutation CreateRole($data: RoleCreateInput!) {
      createRole(data: $data) {
        id
        name
        code
        is_scoped
        scope_model
      }
    }`,
    update: `mutation UpdateRole($id: Int!, $data: RoleCreateInput!) {
      updateRole(id: $id, data: $data) {
        id
        name
        code
        is_scoped
        scope_model
      }
    }`,
    delete: `mutation DeleteRole($id: Int!) {
      deleteRole(id: $id)
    }`,
  },
  role_resolver: {
    get: `query GetListRoleResolverPermissionByRole($roleId: Int!) {
      getListRoleResolverPermissionByRole(roleId: $roleId) {
        id
        role {
          id
          name
          code
        }
        resolverPermission {
          id
          resolverName
          type
          group {
            id
            name
          }
          description
          created_at
          updated_at
        }
        created_at
        updated_at
      }
    }`,
    create: `mutation CreateRoleResolverPermission($permissionId: Int!, $roleId: Int!) {
      createRoleResolverPermission(permissionId: $permissionId, roleId: $roleId)
    }`,
    update: `mutation UpdateRoleResolverPermissions($permissionIds: [Int!]!, $roleId: Int!) {
      updateRoleResolverPermissions(permissionIds: $permissionIds, roleId: $roleId)
    }`,
    delete: `mutation DeleteRoleResolverPermission($permissionId: Int!, $roleId: Int!) {
      deleteRoleResolverPermission(permissionId: $permissionId, roleId: $roleId)
    }`,
  },
  user: {
    get: `query GetUserListByRole($roleCode: String!) {
      GetUserListByRole(role_code: $roleCode) {
        data {
          id
          email
          name
          telepon
          sso_identity
        }
        total
      }
    }`,
  },
}
