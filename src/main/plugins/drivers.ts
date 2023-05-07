import extronSisDriver from '@main/drivers/extron/sis'
import sonyRs485Driver from '@main/drivers/sony/rs485'
import teslaSmartMatrixDriver from '@main/drivers/tesla-smart/matrix'
import teslaSmartSdiDriver from '@main/drivers/tesla-smart/sdi'
import useDrivers from '@main/system/driver'

const registerDrivers = () => {
  const { register } = useDrivers()

  register(extronSisDriver)
  register(sonyRs485Driver)
  register(teslaSmartMatrixDriver)
  register(teslaSmartSdiDriver)
}

export default registerDrivers
