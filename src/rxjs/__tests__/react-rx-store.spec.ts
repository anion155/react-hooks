import { describe, expect, test } from "@jest/globals";
import { BehaviorSubject, delay, of, throwError } from "rxjs";

import { EmptyValueError } from "../errors";
import {
  createReactRxStore,
  getImmediate,
  isImmediateCompleted,
  isReactRxStore,
} from "../react-rx-store";

describe("isReactRxStore, without store", () => {
  const value = Symbol("test-value") as symbol;
  const subject = new BehaviorSubject(value);
  const createStore = () => {
    const prototype = Object.create(subject);
    prototype.reactSubscription = () => {};
    prototype.reactDispatch = () => {};
    prototype.getValue = () => {};
    const store = Object.create(prototype);
    store.reactSubscription = () => {};
    store.reactDispatch = () => {};
    store.getValue = () => {};
    return store;
  };

  test("with store like object", () => {
    expect(isReactRxStore(createStore())).toBe(true);
  });

  test("with invalid reactSubscription", () => {
    const store = createStore();
    store.reactSubscription = 1;
    expect(isReactRxStore(store)).toBe(false);
  });

  test("with prototype reactSubscription", () => {
    const store = createStore();
    delete store.reactSubscription;
    expect(isReactRxStore(store)).toBe(false);
  });

  test("with invalid reactDispatch", () => {
    const store = createStore();
    store.reactDispatch = 1;
    expect(isReactRxStore(store)).toBe(false);
  });

  test("with prototype reactDispatch", () => {
    const store = createStore();
    delete store.reactDispatch;
    expect(isReactRxStore(store)).toBe(false);
  });

  test("with invalid getValue", () => {
    const store = createStore();
    store.getValue = 1;
    expect(isReactRxStore(store)).toBe(false);
  });

  test("with prototype getValue", () => {
    const store = createStore();
    delete store.getValue;
    expect(isReactRxStore(store)).toBe(false);
  });

  test("with plain subject", () => {
    expect(isReactRxStore(subject)).toBe(false);
  });
});

describe("getImmediate", () => {
  const value = Symbol("test-value") as symbol;
  const error = Symbol("test-error") as symbol;

  test("with completed with value", () => {
    const source = of(value);
    expect(getImmediate(source)).toStrictEqual({ value });
  });

  test("with delayed", () => {
    const source = of(value).pipe(delay(1));
    expect(getImmediate(source)).toBeUndefined();
  });

  test("with errored", () => {
    const source = throwError(() => error);
    expect(getImmediate(source)).toStrictEqual({ error });
  });

  test("with completed without value", () => {
    const source = new BehaviorSubject(value);
    source.complete();
    expect(getImmediate(source)).toStrictEqual({
      error: expect.any(EmptyValueError),
    });
  });
});

describe("isImmediateCompleted", () => {
  const value = Symbol("test-value") as symbol;

  test("with continued", () => {
    const source = new BehaviorSubject(value);
    expect(isImmediateCompleted(source)).toBe(false);
  });

  test("with completed with value", () => {
    const source = of(value);
    expect(isImmediateCompleted(source)).toBe(false);
  });

  test("with completed without value", () => {
    const source = new BehaviorSubject(value);
    source.complete();
    expect(isImmediateCompleted(source)).toBe(true);
  });
});

describe("createReactRxStore", () => {
  const value = Symbol("test-value") as symbol;
  const subject = new BehaviorSubject(value);
  const subjectCompleted = new BehaviorSubject(value);
  subjectCompleted.complete();

  test("create, with value", () => {
    const store = createReactRxStore(value);
    expect(isReactRxStore(store)).toBe(true);
    expect(store.getValue()).toBe(value);
  });

  test("create, with value fabric", () => {
    const store = createReactRxStore(() => value);
    expect(isReactRxStore(store)).toBe(true);
    expect(store.getValue()).toBe(value);
  });

  test("create, with subject", () => {
    const store = createReactRxStore(subject);
    expect(isReactRxStore(store)).toBe(true);
    expect(store.getValue()).toBe(value);
  });

  test("create, with subject fabric", () => {
    const store = createReactRxStore(() => subject);
    expect(isReactRxStore(store)).toBe(true);
    expect(store.getValue()).toBe(value);
  });

  test("create, with completed subject", () => {
    const store = createReactRxStore(() => subject);
    expect(isReactRxStore(store)).toBe(true);
    expect(store.getValue()).toBe(value);
  });

  test("create, with store", () => {
    const testStore = createReactRxStore(value);
    const store = createReactRxStore(testStore);
    expect(store).toBe(testStore);
  });

  test("create, with store fabric", () => {
    const testStore = createReactRxStore(value);
    const store = createReactRxStore(() => testStore);
    expect(store).toBe(testStore);
  });

  test("create, with completed store", () => {
    const testStore = createReactRxStore(value);
    testStore.complete();
    const store = createReactRxStore(testStore);
    expect(store).not.toBe(testStore);
    expect(isReactRxStore(store)).toBe(true);
    expect(isImmediateCompleted(store)).toBe(false);
    expect(store.getValue()).toBe(value);
  });
});