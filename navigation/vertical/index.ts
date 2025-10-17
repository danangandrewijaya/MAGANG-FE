export default [
  {
    title: 'Dashboard',
    to: { name: 'index' },
    icon: { icon: 'bx-home-alt' },
  },
  {
    title: 'Kontrak',
    to: { name: 'kontrak' },
    icon: { icon: 'bx-file' },
  },
  {
    title: 'Progres Kontrak',
    to: { name: 'progres-kontrak' },
    icon: { icon: 'bx-task' },
  },
  {
    title: 'Pembayaran Kontraks',
    to: { name: 'pembayaran-kontrak' },
    icon: { icon: 'bx-dollar-circle' },
  },
  {
    title: 'Pengaturan',
    icon: { icon: 'bx-cog' },
    children: [
      {
        title: 'Penyedia',
        to: { name: 'pengaturan-penyedia' },

        // icon: { icon: 'bx-building-house' },
      },
      {
        title: 'User',
        to: { name: 'pengaturan-user' },

        // icon: { icon: 'bx-user' },
      },
      {
        title: 'Role',
        to: { name: 'pengaturan-role' },

        // icon: { icon: 'bx-shield-quarter' },
      },
      {
        title: 'Permission',
        to: { name: 'pengaturan-permission' },

        // icon: { icon: 'bx-lock-alt' },
      },
    ],
  },

  // {
  //   title: 'Invoice',
  //   to: { name: 'invoice' },
  //   icon: { icon: 'bx-file-blank' },
  // },
  // {
  //   title: 'Verifikasi',
  //   to: { name: 'verifikasi' },
  //   icon: { icon: 'bx-file-blank' },
  // },
  // {
  //   title: 'Monitoring',
  //   to: { name: 'monitoring' },
  //   icon: { icon: 'bx-file-blank' },
  // },
  // {
  //   title: 'Access Control',
  //   to: { name: 'access-control' },
  //   icon: { icon: 'bx-cog' },
  // },
  // {
  //   title: 'Pengaturan',
  //   to: { name: 'pengaturan' },
  //   icon: { icon: 'bx-log-out' },
  // },
]
