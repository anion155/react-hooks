import { CanceledError } from "@anion155/react-hooks/utils";
import { describe, expect, jest, test } from "@jest/globals";
import {
  Subscription,
  of,
  throwError,
  Subject,
  first,
  BehaviorSubject,
  delay,
} from "rxjs";

import { EmptyValueError } from "../errors";
import type { PromiseSubscriber } from "../to-promise";
import { toPromise } from "../to-promise";

describe("toPromise", () => {
  const value = Symbol("test-value") as symbol;
  const error = Symbol("test-error") as symbol;

  describe("return promise", () => {
    const subscription = new Subscription();
    const subscriber = jest.fn<PromiseSubscriber<symbol>>(
      (source, resolve, reject) => {
        source.pipe(first()).subscribe({ next: resolve, error: reject });
        return subscription;
      }
    );

    test("with subscriber", async () => {
      const source = of(value);
      const promise = toPromise(source, subscriber);

      expect(subscriber).toHaveBeenCalledWith(
        source,
        expect.any(Function),
        expect.any(Function)
      );
      expect(promise.subscription).toBe(subscription);
      await expect(promise).resolves.toBe(value);
    });

    test("with subscriber that do not return subscription", () => {
      subscriber.mockReturnValueOnce(undefined as any);
      expect(() => toPromise(of(value), subscriber)).toThrow(
        "DeveloperError: subscription is not created yet, should never happen"
      );
    });

    test("with subscriber that return not instance of Subscription", () => {
      subscriber.mockReturnValueOnce({ add: () => {} } as any);
      expect(() => toPromise(of(value), subscriber)).toThrow(
        "DeveloperError: subscription is not created yet, should never happen"
      );
    });

    test("promise cancel runs unsubscribe", () => {
      try {
        jest.useFakeTimers();
        const promise = toPromise(of(value).pipe(delay(200)));
        promise.catch(() => {});
        promise.cancel();

        expect(promise.subscription.closed).toBe(true);
      } finally {
        jest.useRealTimers();
      }
    });

    test("unsubscribe cancels promise", async () => {
      try {
        jest.useFakeTimers();
        const promise = toPromise(of(value).pipe(delay(200)));

        promise.subscription.unsubscribe();
        await expect(promise).rejects.toBeInstanceOf(CanceledError);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe("subscribers", () => {
    const result =
      jest.fn<(result: { value: unknown } | { error: unknown }) => void>();
    const resolve = jest.fn((resolved: unknown) => {
      if (!result.mock.lastCall) result({ value: resolved });
    });
    const reject = jest.fn((rejected: unknown) => {
      if (!result.mock.lastCall) result({ error: rejected });
    });

    const completed = new Subject();
    completed.complete();

    const wrappedSubscriber = jest.fn<PromiseSubscriber<symbol>>(
      (source, resolveCb, rejectCb) =>
        source.pipe(first()).subscribe({ next: resolveCb, error: rejectCb })
    );

    describe(".first", () => {
      const subscriber = toPromise.first();

      test("with value", () => {
        const subscription = subscriber(of(value), resolve, reject);

        expect(subscription).toBeInstanceOf(Subscription);
        expect(result).toHaveBeenCalledWith({ value });
      });

      test("with error", () => {
        subscriber(
          throwError(() => error),
          resolve,
          reject
        );
        expect(result).toHaveBeenCalledWith({ error });
      });

      test("without value", () => {
        subscriber(completed, resolve, reject);
        expect(result).toHaveBeenCalledWith({
          error: expect.any(EmptyValueError),
        });
      });
    });

    describe(".last", () => {
      const subscriber = toPromise.last();

      test("with value, without completion", () => {
        const source = new BehaviorSubject(value);
        const subscription = subscriber(source, resolve, reject);

        expect(subscription).toBeInstanceOf(Subscription);
        expect(result).not.toHaveBeenCalled();
      });

      test("with value, with completion", () => {
        const source = new BehaviorSubject(value);
        subscriber(source, resolve, reject);
        source.complete();

        expect(result).toHaveBeenCalledWith({ value });
      });

      test("with error", () => {
        subscriber(
          throwError(() => error),
          resolve,
          reject
        );
        expect(result).toHaveBeenCalledWith({ error });
      });

      test("without value", () => {
        subscriber(completed, resolve, reject);
        expect(result).toHaveBeenCalledWith({
          error: expect.any(EmptyValueError),
        });
      });
    });

    describe(".withInitial", () => {
      const initial = Symbol("test-initial") as symbol;
      const subscriber = toPromise.withInitial(initial, wrappedSubscriber);

      test("with resolved", () => {
        const source = of(value);
        const subscription = subscriber(source, resolve, reject);

        expect(subscription).toBe(wrappedSubscriber.mock.results[0].value);
        expect(wrappedSubscriber).toHaveBeenCalledWith(
          source,
          resolve,
          expect.any(Function)
        );
        expect(result).toHaveBeenCalledWith({ value });
      });

      test("with error of EmptyValueError", () => {
        subscriber(
          throwError(() => new EmptyValueError()),
          resolve,
          reject
        );
        expect(result).toHaveBeenCalledWith({ value: initial });
      });

      test("with other error", () => {
        subscriber(
          throwError(() => error),
          resolve,
          reject
        );
        expect(result).toHaveBeenCalledWith({ error });
      });
    });

    describe(".throttle", () => {
      test("first time", () => {
        const subscriber = toPromise.throttle(wrappedSubscriber);
        const source = of(value);
        const subscription = subscriber(source, resolve, reject);

        expect(subscription).toBe(wrappedSubscriber.mock.results[0].value);
        expect(wrappedSubscriber).toHaveBeenCalledWith(source, resolve, reject);
        expect(result).toHaveBeenCalledWith({ value });
      });

      test("second time", () => {
        const subscriber = toPromise.throttle(wrappedSubscriber);
        const subscription = subscriber(new Subject(), resolve, reject);
        const unsubscribe = jest.spyOn(subscription, "unsubscribe");
        subscriber(new Subject(), resolve, reject);

        expect(unsubscribe).toHaveBeenCalledWith();
      });
    });

    describe(".defaultSubscriber", () => {
      const subscriber = toPromise.defaultSubscriber();

      test("with value", () => {
        const subscription = subscriber(of(value), resolve, reject);

        expect(subscription).toBeInstanceOf(Subscription);
        expect(result).toHaveBeenCalledWith({ value });
      });

      test("with error", () => {
        subscriber(
          throwError(() => error),
          resolve,
          reject
        );
        expect(result).toHaveBeenCalledWith({ error });
      });

      test("without value", () => {
        subscriber(completed, resolve, reject);
        expect(result).toHaveBeenCalledWith({ value: undefined });
      });
    });
  });
});
