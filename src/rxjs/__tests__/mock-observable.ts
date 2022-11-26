import { jest } from "@jest/globals";
import type { Observable, Subscription } from "rxjs";

export function mockObservable<T>(source: Observable<T>) {
  const subscribe: jest.Mock<Observable<T>["subscribe"]> = jest.fn();
  const unsubscribe: jest.Mock<Subscription["unsubscribe"]> = jest.fn();

  subscribe.mockImplementation(source.subscribe);
  // eslint-disable-next-line no-param-reassign -- intentional
  source.subscribe = (...subArgs: never[]) => {
    const subscription = subscribe.apply(source, subArgs);
    unsubscribe.mockImplementation(subscription.unsubscribe);
    subscription.unsubscribe = (...unsubArgs: never[]) => {
      return unsubscribe.apply(subscription, unsubArgs);
    };
    return subscription;
  };

  return { subscribe, unsubscribe };
}
