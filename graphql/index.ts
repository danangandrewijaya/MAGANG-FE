import { dokumentQuery } from './modules/dokument'
import { kontrakQuery } from './modules/kontrak'
import { kontrakAdendumQuery } from './modules/kontrak_adendum'
import { kontrakPembayaranQuery } from './modules/kontrak_pembayaran'
import { kontrakPenilaianQuery } from './modules/kontrak_penilaian'
import { kontrakProgressQuery } from './modules/kontrak_progress'
import { kontrakVerifikasiQuery } from './modules/kontrak_verifikasi'
import { menuQuery } from './modules/menu'
import { paketPengadaanQuery } from './modules/paket_pengadaan'
import { penyediaQuery } from './modules/penyedia'
import { permissionQuery } from './modules/permission'
import { subSubUnitQuery } from './modules/sub_sub_unit'
import { sumberDanaQuery } from './modules/sumber_dana'
import { terminQuery } from './modules/termin'
import { userQuery } from './modules/user'

export default {
  ...userQuery,
  ...permissionQuery,
  ...penyediaQuery,
  ...kontrakQuery,
  ...paketPengadaanQuery,
  ...dokumentQuery,
  ...sumberDanaQuery,
  ...subSubUnitQuery,
  ...kontrakProgressQuery,
  ...kontrakAdendumQuery,
  ...kontrakPembayaranQuery,
  ...terminQuery,
  ...menuQuery,
  ...kontrakPenilaianQuery,
  ...kontrakVerifikasiQuery

}
