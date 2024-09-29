import Logger from 'electron-log'
import { execa } from 'execa'
import { memo } from 'radash'

interface TypeMap {
  string: string
  int16: number
  uint16: number
  int32: number
  uint32: number
  int64: bigint
  uint64: bigint
  double: number
  byte: number
  boolean: boolean
  objpath: string
}

interface KeyMap {
  string: string
  int16: number
  uint16: number
  int32: number
  uint32: number
  double: number
  byte: number
  objpath: string
}

const useDbus = memo(() => {
  /**
   * Targets bus.
   */
  type DBusTarget = '--system' | '--session'

  /**
   * Sends a DBus command via dbus-send(1)
   * @param target Target bus.
   * @param dest Connection name.
   * @param path Object path.
   * @param ifname Interface name.
   * @param member Member name.
   * @param args Method arguments.
   * @returns Result message.
   */
  async function dbusSend(
    target: DBusTarget,
    dest: string,
    path: string,
    ifname: string,
    member: string,
    ...args: string[]
  ) {
    const params = [target, '--print-reply', `--dest=${dest}`, path, `${ifname}.${member}`, ...args]

    Logger.debug('execa:dbus-send', ...params)
    const { stdout, stderr, exitCode } = await execa('dbus-send', params)

    if (exitCode !== 0) {
      throw new Error(stderr)
    }

    return stdout.toString()
  }

  /** Gets the schema named type to its argument type. */
  type ArgFromType<T> = T extends keyof TypeMap
    ? TypeMap[T]
    : T extends `array:${infer V extends keyof TypeMap}`
      ? TypeMap[V][]
      : T extends `dict:${infer K extends keyof KeyMap}:${infer V extends keyof TypeMap}`
        ? Record<KeyMap[K], TypeMap[V]>
        : T extends 'variant'
          ? unknown
          : never

  /** Converts a binding schema to a parameter tuple. */
  type ArgsFromSchame<Schema> = Schema extends [infer Single]
    ? [ArgFromType<Single>]
    : Schema extends [infer Head, ...infer Rest]
      ? [ArgFromType<Head>, ...ArgsFromSchame<Rest>]
      : Schema extends [infer Head, infer Last]
        ? [ArgFromType<Head>, ArgFromType<Last>]
        : never

  /** Support schema types. */
  type SchemaType = keyof TypeMap | 'variant' | `array:${keyof TypeMap}` | `dict:${keyof KeyMap}:${keyof TypeMap}`

  /** Dictionary detector. */
  const kDictType = /^dict:([a-z0-9]+):([a-z0-9]+)$/u

  /** Encodes a diction. */
  function encodeDict(key: keyof KeyMap, value: keyof TypeMap, dict: Record<string | number, unknown>) {
    const encodeKey = key === 'string' ? (k: string | number) => `"${k}"` : (k: string | number) => String(k)
    const encodeValue = value === 'string' ? (v: unknown) => `"${v as string}"` : (v: unknown) => String(v)

    return `dict:${key}:${value}:${Object.entries(dict)
      .map(([k, v]) => `${encodeKey(k)},${encodeValue(v)}`)
      .join(',')}`
  }

  /** Defines the variant numeric type ranges. */
  const Limits = {
    // Signed
    INT8_MIN: BigInt.asIntN(8, 0x80n),
    INT8_MAX: BigInt.asIntN(8, 0x7fn),
    INT16_MIN: BigInt.asIntN(16, 0x8000n),
    INT16_MAX: BigInt.asIntN(16, 0x7fffn),
    INT32_MIN: BigInt.asIntN(32, 0x80000000n),
    INT32_MAX: BigInt.asIntN(32, 0x7fffffffn),
    INT64_MIN: BigInt.asIntN(64, 0x8000000000000000n),
    INT64_MAX: BigInt.asIntN(64, 0x7fffffffffffffffn),
    // Unsigned
    UINT8_MAX: 0xffn,
    UINT16_MAX: 0xffffn,
    UINT32_MAX: 0xffffffffn,
    UINT64_MAX: 0xffffffffffffffffn
  }

  /** Encodes a number into a variant. */
  function encodeVariantNumber(value: number) {
    if (value >= 0) {
      // Positive side
      if (value <= Limits.INT8_MAX) {
        return `variant:int8:${value}`
      } else if (value <= Limits.UINT8_MAX) {
        return `variant:uint8:${value}`
      } else if (value <= Limits.INT16_MAX) {
        return `variant:int16:${value}`
      } else if (value <= Limits.UINT16_MAX) {
        return `variant:uint16:${value}`
      } else if (value <= Limits.INT32_MAX) {
        return `variant:int32:${value}`
      } else if (value <= Limits.UINT32_MAX) {
        return `variant:uint32:${value}`
      } else if (value <= Number.MAX_SAFE_INTEGER) {
        return `variant:int64:${value}`
      } else if (value <= Number.MAX_VALUE) {
        return `variant:double:${value}`
      }

      throw new TypeError('Numbe is out of range')
    }

    // Negative side
    if (value >= Limits.INT8_MIN) {
      return `variant:int8:${value}`
    } else if (value >= Limits.INT16_MIN) {
      return `variant:int16:${value}`
    } else if (value >= Limits.INT32_MIN) {
      return `variant:int32:${value}`
    } else if (value >= Number.MIN_SAFE_INTEGER) {
      return `variant:int64:${value}`
    } else if (value >= -Number.MAX_VALUE) {
      return `variant:double:${value}`
    }

    throw new TypeError('Numbe is out of range')
  }

  /** Encodes a bigint into a variant. */
  function encodeVariantBigInt(value: bigint) {
    if (value >= 0) {
      // Positive side
      if (value <= Limits.INT8_MAX) {
        return `variant:int8:${value}`
      } else if (value <= Limits.UINT8_MAX) {
        return `variant:uint8:${value}`
      } else if (value <= Limits.INT16_MAX) {
        return `variant:int16:${value}`
      } else if (value <= Limits.UINT16_MAX) {
        return `variant:uint16:${value}`
      } else if (value <= Limits.INT32_MAX) {
        return `variant:int32:${value}`
      } else if (value <= Limits.UINT32_MAX) {
        return `variant:uint32:${value}`
      } else if (value <= Limits.INT64_MAX) {
        return `variant:int64:${value}`
      } else if (value <= Limits.UINT64_MAX) {
        return `variant:uint64:${value}`
      } else if (value <= Number.MAX_VALUE) {
        return `variant:double:${Number(value)}`
      }

      throw new TypeError('Numbe is out of range')
    }

    // Negative side
    if (value >= Limits.INT8_MIN) {
      return `variant:int8:${value}`
    } else if (value >= Limits.INT16_MIN) {
      return `variant:int16:${value}`
    } else if (value >= Limits.INT32_MIN) {
      return `variant:int32:${value}`
    } else if (value >= Limits.INT64_MIN) {
      return `variant:int64:${value}`
    } else if (value >= -Number.MAX_VALUE) {
      return `variant:double:${Number(value)}`
    }

    throw new TypeError('Numbe is out of range')
  }

  /** Encodes a value into a variant. */
  function encodeVariant(index: number, arg: unknown) {
    switch (typeof arg) {
      case 'object':
        throw new TypeError(`dbus-send does not support sending containers in a variant at argument position ${index}`)
      case 'symbol':
        throw new TypeError(`dbus-send does not support sending a symbol in a variant at argument position ${index}`)
      case 'boolean':
        return `variant:boolean:${String(arg)}`
      case 'string':
        return `variant:string:"${arg}"`
      case 'number':
        return encodeVariantNumber(arg)
      case 'bigint':
        return encodeVariantBigInt(arg)
      case 'function':
        throw new TypeError(`dbus-send does not support sending a function in a variant at argument position ${index}`)
      default:
        throw new TypeError(
          `dbus-send does not support sending ${typeof arg} in a variant at argument position ${index}`
        )
    }
  }

  /** Encodes the parameters based on a binding schema. */
  function encodeParams(schema: SchemaType[], args: unknown[]) {
    return schema.map((type, index) => {
      // NOTE: All logic here depends on TypeScript type
      // checking to ensure all strings and data are
      // correct, only the nullish check is done.
      // NOTE: No checks are done on the size of numeric
      // values, so care must be taken not to overflow
      // them. This may be added later.
      const arg = args[index]
      if (arg == null) {
        throw new ReferenceError(`Argument in position ${index} was expected to be ${type}`)
      }

      if (type === 'variant') {
        return encodeVariant(index, arg)
      }

      if (type === 'array:string') {
        return `array:string:${(arg as string[]).map((v) => `"${v}"`).join(',')}`
      }

      if (type.startsWith('array:')) {
        return `${type}:${(arg as string[]).map((v) => `"${String(v)}"`).join(',')}`
      }

      const match = kDictType.exec(type)
      if (match != null) {
        return encodeDict(match[1] as keyof KeyMap, match[2] as keyof TypeMap, arg as Record<string | number, unknown>)
      }

      if (type === 'string') {
        return `${type}:"${arg as string}"`
      }

      return `${type}:${String(arg)}`
    })
  }

  /**
   * Creates a DBus bound function.
   * @param target Target bus.
   * @param dest Connection name.
   * @param path Object path.
   * @param ifname Interface name.
   * @param member Member name.
   * @param schema Argument schema.
   * @returns A bound function that uses dbus-send(1)
   */
  function dbusBind<Type extends SchemaType, Schema extends [Type, ...Type[]]>(
    target: DBusTarget,
    dest: string,
    path: string,
    ifname: string,
    member: string,
    schema: Schema
  ): (...args: ArgsFromSchame<Schema>) => Promise<string> {
    return async (...args) => {
      const params = encodeParams(schema, args)

      return await dbusSend(target, dest, path, ifname, member, ...params)
    }
  }

  return {
    dbusSend,
    dbusBind
  }
})

export default useDbus
