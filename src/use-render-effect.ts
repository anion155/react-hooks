import type { DependencyList, EffectCallback } from "react";
import { useEffect, useRef } from "react";

type RenderEffectState = {
  cleanup: ReturnType<EffectCallback>;
  deps: DependencyList;
};

export function useRenderEffect(
  effect: EffectCallback,
  deps: DependencyList
): void {
  const state = useRef<RenderEffectState>();
  const prev = state.current;

  useEffect(() => state.current?.cleanup, []);

  if (prev && deps.length === prev.deps.length) {
    let equal = true;
    for (let index = 0; index < deps.length; index += 1) {
      if (deps[index] !== prev.deps[index]) {
        equal = false;
      }
    }
    if (equal) return;
  }

  prev?.cleanup?.();
  state.current = { cleanup: effect(), deps };
}
