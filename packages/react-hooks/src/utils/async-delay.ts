export function asyncDelay(
  timeout: number
): Promise<void> & { clear: () => void } {
  let id: ReturnType<typeof setTimeout> | undefined;
  const promise = new Promise<void>((resolve) => {
    id = setTimeout(resolve, timeout);
  });

  return Object.assign(promise, {
    clear: () => {
      clearTimeout(id);
    },
  });
}
