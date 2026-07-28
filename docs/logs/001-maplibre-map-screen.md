# 001 — MapLibre map screen

## What we did

- Added `@maplibre/maplibre-react-native` (installed with `bun add`, via
  `bunx expo install`) and its Expo config plugin, which `expo install`
  wired into `app.json` automatically.
- Added `src/app/map.tsx`: a screen with a `Map`, a `Camera` (imperative ref,
  `flyTo`/`fitBounds`), and a `Marker` per mocked hotel. Style tiles come from
  OpenFreeMap (`src/constants/map.ts`), free and keyless.
- Wired the hotel list (`src/app/index.tsx`) so tapping a hotel navigates to
  `/map?hotelId=...` (camera flies to that hotel) and a "View all on map"
  button navigates to `/map` with no id (camera fits all 5 hotels).
- Ran `npx expo prebuild` to regenerate `ios/` and `android/` with the plugin
  applied.

## The error we hit, and why

After prebuild, reloading the JS bundle in the already-running Simulator app
threw:

```
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'MLRNCameraModule'
could not be found. Verify that a module by this name is registered in the
native binary.
```

MapLibre isn't pure JS — it ships native iOS/Android code (Swift/Obj-C and
Kotlin/Java) that gets compiled into the app binary. `expo start` (`bun
start`) only serves the *JavaScript bundle* over Metro; it never touches the
compiled native binary already installed on the simulator. That binary was
built *before* MapLibre's native module existed in the project, so no amount
of JS-bundle reloading will make `MLRNCameraModule` appear — the native code
that registers it was never compiled in.

**Fix:** run `bun run ios` (`expo run:ios`), which compiles a fresh native
binary (this time including MapLibre's native code) and reinstalls it on the
simulator. After that, normal `bun start` + fast refresh works again — you
only need to repeat the native build when a *native* dependency
(anything requiring a config plugin / native module, not a pure-JS package)
is added, upgraded, or has its config plugin settings changed.

## `prebuild` vs `run:ios` — why both were needed

These do genuinely different jobs, which is what caused the confusion:

- **`expo prebuild`** *generates the native project source* — it reads
  `app.json`/config plugins and writes/updates the `ios/` and `android/`
  folders (Xcode project, `Podfile`, Gradle files, `AndroidManifest.xml`,
  etc.). It's a source-code generation step, comparable to running `cmake`
  to produce a build directory. **It does not invoke a compiler.** No `.app`
  or `.apk` comes out of it — CocoaPods gets installed (dependency
  resolution) but nothing gets built.
- **`expo run:ios` / `expo run:android`** *compiles and installs* — it runs
  `prebuild` internally if the native folders don't exist yet, but its real
  job is invoking the actual native toolchain (`xcodebuild` / Gradle) to
  compile that generated project into a binary, then installs and launches
  it on the simulator/device.

So calling `prebuild` on its own regenerated the `ios/`/`android/` project
files (now referencing the MapLibre pod/AAR) but left the simulator running
the *old, already-compiled* binary untouched — nothing had recompiled it
yet. `run:ios` was the step that actually produced a new binary with
MapLibre's native code linked in.

In hindsight, calling `prebuild` explicitly first wasn't necessary here —
`expo run:ios` would have run it internally anyway. It's occasionally useful
to run prebuild standalone when you want to inspect the generated native
project without waiting for a full compile, but for a normal
"add a native dependency" workflow, `expo run:ios` / `expo run:android`
alone is the only command needed.

## Rule of thumb going forward

- Pure JS/TS dependency added → `bun start` reload is enough.
- Native dependency added, upgraded, or its config plugin settings changed
  → need a fresh `expo run:ios` / `expo run:android` before JS reload will
  work again.
