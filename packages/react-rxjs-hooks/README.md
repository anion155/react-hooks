# React Hooks and utilities library

This library contains utilities and react hooks.

## API

### header

Is a replacement of `React.createContext` and has similar api. Only exception is that Consumer now accepts `selector` property, which would select value passed to `children` function

```ts
function createSelectableContext<T>(defaultValue: T): SelectableContext<T>;

type SelectableProviderProps<T> = {
  value: T;
  children?: React.ReactNode | undefined;
};
type SelectableConsumerProps<T, R = T> = {
  selector?: (value: T) => R;
  children: (selected: R) => React.ReactNode;
};
type SelectableContext<T> = {
  Provider: FC<SelectableProviderProps<T>>;
  Consumer: <R = T>(props: SelectableConsumerProps<T, R>) => ReactElement;
  defaultValue: T;
};
```
