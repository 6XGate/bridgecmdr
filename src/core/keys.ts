import type { Tagged } from 'type-fest'

export type BrandedBases = symbol | number | string

declare const KeyType: unique symbol

export type BrandedKey<Key extends BrandedBases, Kind extends PropertyKey, T> = Tagged<
  Key,
  Kind,
  {
    [KeyType]: T
  }
>

export type SymbolKey<Kind extends string, T> = BrandedKey<symbol, Kind, T>

export type NumericKey<Kind extends string, T> = BrandedKey<number, Kind, T>

export type StringKey<Kind extends string, T> = BrandedKey<string, Kind, T>
