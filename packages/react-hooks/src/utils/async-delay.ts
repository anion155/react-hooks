import type { CancelablePromise } from "./cancelable-promise";
import { cancelablePromise } from "./cancelable-promise";

export function asyncDelay(timeout: number): CancelablePromise<void> {
  return cancelablePromise<void>((resolve) => {
    const id = setTimeout(resolve, timeout);
    return () => clearTimeout(id);
  });
}
