# Testing conventions

## File layout

Tests are colocated with the source they cover — `Thing.tsx` /
`Thing.test.tsx`, `useThing.ts` / `useThing.test.ts` — not grouped in
`__tests__/` folders. Colocated tests are easier to spot when browsing a
directory (you immediately see which files have coverage), and this repo's
structure (small feature-per-file components/hooks) doesn't really call for
grouping tests separately. Reach for `__tests__/` only if a test stops
belonging to one specific source file (e.g. a cross-file/integration test).

## Jest setup gotchas

Some dependencies ship untranspiled ESM builds that Jest's default
`transformIgnorePatterns` (everything under `node_modules` is skipped)
doesn't cover, producing `SyntaxError: Unexpected token 'export'` or
`Cannot use import statement outside a module`. When that happens, add the
package name to the allowlist regex in `package.json`'s `jest.transformIgnorePatterns`
rather than working around it another way — `immer` and `react-redux` are
already there for this reason.

## Testing a Redux-connected component

Wrap it in a real `Provider` with a fresh `configureStore` per test — no
need for a separate mock reducer, just reuse the slice's real reducer:

```ts
render(
  <Provider store={configureStore({ reducer: { favorites: favoritesReducer } })}>
    <FavoriteButton hotel={mockHotel} />
  </Provider>,
);
```

A store created with no preloaded state starts from the slice's
`initialState`, so assert the component's *starting* state matches that
before interacting with it.

## `fireEvent` is async

`fireEvent.press` (and friends) returns a `Promise` — it wraps the dispatch
in `act()` internally. Forgetting to `await` it means later assertions run
before the state update/re-render has actually happened, and you'll see
stale values instead of an error:

```ts
await fireEvent.press(button);
```

Re-query the element after each interaction instead of reusing the old
`ReactTestInstance` reference — that's the reliable way to read the current
render's props (`element.props.someProp`), even if the old reference often
happens to reflect updates too.
