import extronSisDriver from '../drivers/extron/sis'
import sonyRs485Driver from '../drivers/sony/rs485'
import teslaSmartKvmDriver from '../drivers/tesla-smart/kvm'
import teslaSmartMatrixDriver from '../drivers/tesla-smart/matrix'
import teslaSmartSdiDriver from '../drivers/tesla-smart/sdi'
import useDrivers from '../services/driver'

export default function registerDrivers() {
  const { register } = useDrivers()

  register(extronSisDriver)
  register(sonyRs485Driver)
  register(teslaSmartMatrixDriver)
  register(teslaSmartKvmDriver)
  register(teslaSmartSdiDriver)
}
