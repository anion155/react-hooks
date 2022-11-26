import type { Observable, PartialObserver } from "rxjs";
import { BehaviorSubject } from "rxjs";

import { EmptyValueError } from "./errors";

export interface ReactRxStore<T> extends BehaviorSubject<T> {
  reactSubscription: (onStoreChange: () => void) => () => void;
  reactDispatch: {
    (value: T): void;
    (modifier: (current: T) => T): void;
  };
}

export function isReactRxStore<T>(
  subject: BehaviorSubject<T>
): subject is ReactRxStore<T> {
  const obj = subject as any;
  return (
    Object.prototype.hasOwnProperty.call(obj, "reactSubscription") &&
    obj.reactSubscription instanceof Function &&
    Object.prototype.hasOwnProperty.call(obj, "reactDispatch") &&
    obj.reactDispatch instanceof Function &&
    Object.prototype.hasOwnProperty.call(obj, "getValue") &&
    obj.getValue instanceof Function
  );
}

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

export function isImmediateCompleted<T>(source: Observable<T>) {
  const result = getImmediate(source);
  return result && "error" in result && result.error instanceof EmptyValueError;
}

export type ReactRxStoreInput<T> =
  | T
  | { (): T }
  | BehaviorSubject<T>
  | { (): BehaviorSubject<T> };

export function createReactRxStore<T>(
  input: ReactRxStoreInput<T>
): ReactRxStore<T> {
  const value = input instanceof Function ? input() : input;

  let subject =
    value instanceof BehaviorSubject ? value : new BehaviorSubject<T>(value);
  if (isImmediateCompleted(subject)) {
    subject = new BehaviorSubject(subject.getValue());
  }
  if (isReactRxStore(subject)) return subject;

  const store: ReactRxStore<T> = Object.create(subject);
  store.reactSubscription = (onStoreChange) => {
    const subscription = store.subscribe(onStoreChange);
    return () => subscription.unsubscribe();
  };
  store.reactDispatch = (modifierOrValue) => {
    const next =
      modifierOrValue instanceof Function
        ? modifierOrValue(store.getValue())
        : modifierOrValue;
    store.next(next);
  };
  store.getValue = store.getValue.bind(store);
  return store;
}
