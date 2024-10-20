/** The type of functions. */
export type Func<Result, Args extends unknown[] = []> = (...args: Args) => Result

/** The type of action functions. */
export type Action<Args extends unknown[] = []> = (...args: Args) => void
