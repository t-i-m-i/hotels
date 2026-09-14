# 010 — expo-location crash: Expo SDK 57 precompiled-modules ABI mismatch

Added `expo-location`. App built fine (`expo prebuild` + `bun run ios`) but
crashed instantly on launch on the iOS Simulator — no Metro logs, no JS ever
ran, just the native crash reporter. Console.app / `simctl` crash report
showed:

```
Termination Reason: DYLD, Symbol missing
Symbol not found: _$s15ExpoModulesCore10BaseModuleC11willDestroyyyFTj
Referenced from: .../Frameworks/ExpoLocation.framework/ExpoLocation
Expected in:     .../Frameworks/ExpoModulesCore.framework/ExpoModulesCore
```

Clean rebuilds (`rm -rf DerivedData`, `ios/build`, `ios/Pods`, fresh
`pod install`, `expo prebuild --clean`) did not fix it — this wasn't a local
build cache problem.

## Root cause

Expo SDK 57's `ios/Podfile` defaults
`ENV['EXPO_USE_PRECOMPILED_MODULES'] ||= '1'`
(see `node_modules/expo-modules-autolinking/scripts/ios/precompiled_modules.rb`).
With this on, CocoaPods doesn't build `ExpoModulesCore`/`ExpoLocation`/etc.
from the `node_modules` source at all — it downloads prebuilt
`.xcframework` tarballs. The `ExpoLocation` and `ExpoModulesCore` tarballs
we got were built against incompatible Swift ABIs (a version-skew bug on
Expo's precompiled-artifact side, not something under our control), so the
app aborted at `dyld` load time before any JS executed.

Confirms as prebuilt: with precompiled modules on, `ios/Pods/ExpoLocation/`
and `ios/Pods/ExpoModulesCore/` exist as `.xcframework` directories on disk
(extracted tarballs). With it off, those directories don't appear at all —
the pods are linked via `:path` straight into `node_modules` and compiled
from source as part of the Xcode build.

## Fix

Force Expo modules to build from source instead of using the precompiled
tarball pipeline, via the `expo-build-properties` config plugin in
`app.json`:

```json
["expo-build-properties", { "ios": { "usePrecompiledModules": false } }]
```

This writes `"EXPO_USE_PRECOMPILED_MODULES": "false"` into
`ios/Podfile.properties.json` on every `expo prebuild`, which the
generated `Podfile` reads regardless of shell environment — so it can't be
forgotten the way an env var prefix on one npm script could be. (An earlier
version of this fix set `EXPO_USE_PRECOMPILED_MODULES=0` only on the `ios`
npm script; that's redundant now and was removed — it wouldn't have
protected a manual `expo prebuild` run anyway, since `pod install` during
`prebuild` reads the flag before the `ios` script ever runs.)

Source builds are slower (first build compiles all of React Native +
every Expo module), but correct. Revisit dropping this once Expo's
precompiled-artifact pipeline is more mature/stable — this is a new SDK 57
feature, likely to change.
