/** Converts a byte array into a Base64 string. */
export function toBase64(data: Uint8Array) {
  return btoa(String.fromCodePoint(...data))
}

function* codePointsOf(data: string) {
  for (let i = 0, cp = data.codePointAt(i); cp != null; ++i, cp = data.codePointAt(i)) {
    yield cp
  }
}

/** Coverts a Base64 string into a byte array. */
export function fromBase64(data: string) {
  return new Uint8Array([...codePointsOf(atob(data))])
}
