import { useRef } from "react";

export function useConst<T>(fabric: () => T) {
  const store = useRef<{ value: T } | null>(null);
  if (!store.current) {
    store.current = { value: fabric() };
  }
  return store.current.value;
}
