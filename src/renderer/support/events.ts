// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Won't match with unknown
export type EventMap = Record<string, (ev: any) => void>

export interface TypedEvent<E extends string> extends Event {
  type: E
}

export type TypedEventConstructor<E extends string, I extends EventInit> =
  new (type: E, init?: I) => TypedEvent<E>

export type TypedEventListener<Type extends string, Event extends TypedEvent<Type>> =
  (event: Event) => void

export interface TypedEventListenerObject<Type extends string, Event extends TypedEvent<Type>> {
  handleEvent: TypedEventListener<Type, Event>
}

export type TypedEventListenerOrListenerObject<Type extends string, Event extends TypedEvent<Type>> =
  | TypedEventListener<Type, Event>
  | TypedEventListenerObject<Type, Event>

export type Listener<Callback extends (ev: Event) => void> =
  TypedEventListenerOrListenerObject<Parameters<Callback>[0]['type'], Parameters<Callback>[0]>

export interface TypedEventTarget<Events extends EventMap> extends EventTarget {
  addEventListener: <E extends keyof Events> (type: E, listener: Listener<Events[E]> | null,
    options?: AddEventListenerOptions | boolean) => void
  removeEventListener: <E extends keyof Events> (type: E, listener: Listener<Events[E]> | null,
    options?: EventListenerOptions | boolean) => void
  dispatchEvent: <E extends keyof Events> (event: Parameters<Events[E]>[0]) => boolean
}

export interface TypedEventTargetEx<Events extends EventMap> extends TypedEventTarget<Events> {
  on: <E extends keyof Events> (type: E, listener: Listener<Events[E]> | null,
    options?: AddEventListenerOptions | boolean) => void
  once: <E extends keyof Events> (type: E, listener: Listener<Events[E]> | null,
    options?: Omit<AddEventListenerOptions, 'once'> | boolean) => void
  off: <E extends keyof Events> (type: E, listener: Listener<Events[E]> | null,
    options?: EventListenerOptions | boolean) => void
  emit: <E extends keyof Events> (event: Parameters<Events[E]>[0]) => boolean
}

const useTypedEventTarget = <Events extends EventMap> (existing?: EventTarget) => {
  const target = (existing ?? new EventTarget()) as TypedEventTarget<Events>

  const addEventListener = target.addEventListener.bind(target)
  const removeEventListener = target.removeEventListener.bind(target)
  const dispatchEvent = target.dispatchEvent.bind(target)

  return {
    addEventListener,
    dispatchEvent,
    removeEventListener,
    on: addEventListener,
    off: removeEventListener,
    emit: dispatchEvent,
    once: (type, listener, options?) => {
      typeof options === 'boolean'
        ? addEventListener(type, listener, { capture: options, once: true })
        : addEventListener(type, listener, { ...options, once: true })
    }
  } satisfies TypedEventTargetEx<Events>
}

export default useTypedEventTarget
