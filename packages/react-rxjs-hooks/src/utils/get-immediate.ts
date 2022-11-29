import type { Observable, PartialObserver } from "rxjs";

import { EmptyValueError } from "./errors";

export function getImmediate<T>(
  source: Observable<T>
): { value: T } | { error: unknown } | undefined {
  let result: { value: T } | { error: unknown } | undefined;
  const immediateObserver: PartialObserver<T> = {
    next: (value) => {
      if (result) return;
      result = { value };
    },
    error: (error) => {
      if (result) return;
      result = { error };
    },
    complete: () => {
      if (result) return;
      result = { error: new EmptyValueError() };
    },
  };
  source.subscribe(immediateObserver).unsubscribe();
  return result;
}
