import extronSisDriver from '../drivers/extron/sis.js'
import sonyRs485Driver from '../drivers/sony/rs485.js'
import teslaSmartKvmDriver from '../drivers/tesla-smart/kvm.js'
import teslaSmartMatrixDriver from '../drivers/tesla-smart/matrix.js'
import teslaSmartSdiDriver from '../drivers/tesla-smart/sdi.js'
import useDrivers from '../system/driver.js'

export default function registerDrivers() {
  const { register } = useDrivers()

  register(extronSisDriver)
  register(sonyRs485Driver)
  register(teslaSmartMatrixDriver)
  register(teslaSmartKvmDriver)
  register(teslaSmartSdiDriver)
}
