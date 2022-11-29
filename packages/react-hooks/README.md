# React Hooks and utilities library

This library contains utilities and react hooks.

## API

### useConst

```ts
function useConst<T>(fabric: () => T): T;
```

Creates value on the first render, at render time.

```ts
const store = useConst(() => createStore());
```

### useRenderEffect

```ts
type EffectCallback = () => (void | (() => void))
function useRenderEffect(effect: EffectCallback, deps: DependencyList): void;
```

Effect hook that runs at render time.

```ts
const ref = useRef(value);
useRenderEffect(() => {
  ref.current = value;
}, [value]);
// ref.current === value
```

> ### Note
>
> It is not guaranteed that cleanup function would be run during render. Specifically last cleanup before unmount is running as `useEffect` cleanup function.

### useSetStateDispatcher

```ts
type SetStateDispatcher<T> = (state: T | ((current: T) => T)) => void;
function useSetStateDispatcher(get: () => T, set: (value: T) => void, deps: DependencyList): SetStateDispatcher<T>
```

Creates set state action dispatcher function, which accepts next value or modifier.

```ts
const store = {
  current: null,
  get() { return this.current; },
  set(next) { this.current = next },
};
const dispatcher = useSetStateDispatcher(
  () => store.get(),
  (next) => store.set(next),
  [store]
);
dispatcher(10);
dispatcher(current => current * 2);
```

### useEventState

```ts
function useEventState<T>(
  stateInitial: StateInitial<T>
): [T, (arg: T) => void];
function useEventState<As extends unknown[], T>(
  stateInitial: StateInitial<T>,
  project: (...args: As) => T,
  deps: DependencyList
): [T, (...args: As) => void];
```

Creates event handler that stores event value in state.

```ts
const [value, handleChange] = useEventState('', (event) => event.target.value);
<>
  <input onChange={handleChange} />
  <span>Value: "{value}"</span>
</>
```

### useConstCallback

```ts
function useConstCallback<As extends unknown[], R>(cb: (...args: As) => R): (...args: As) => R
```

Creates stable callback instance, result function never changes until unmounted.

```ts
const [counter, setCounter] = useState(1);
const cb = useConstCallback(() => {
  setCounter(counter + 1);
});
useEffect(() => {
  console.log('Runs one time only');
}, [cb]);
<button onClick={cb} />
```
