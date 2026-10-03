## GitHub OAuth `state_mismatch` after 2FA mobile-app approval

**Status: resolved** — `account.skipStateCookieCheck: true` in `auth.ts`
fixed the `state_mismatch`; that then exposed the `callbackURL` gap noted
below exactly as predicted (browser landed on a bare `http://localhost:3000/`
→ "Cannot GET /"), fixed by passing `callbackURL` (`redirectTo` from route
params, defaulting to `"/"`) into both `(auth)/login.tsx` and
`(auth)/register.tsx`'s `signIn.social()` calls. Confirmed working end to
end with a full GitHub login.

### Symptom

Logging in via GitHub (`authClient.signIn.social({provider: "github"})`) from
the Expo app: GitHub accepts email+password, the user approves the sign-in via
a push notification in the GitHub mobile app (not a TOTP code typed in the
browser), and the system browser then lands on a BetterAuth-styled error page
at `http://localhost:3000/...` with `ERROR CODE: state_mismatch`.

### Flow (traced across hotels + hotels-api, versions `better-auth@1.7.7` /
`@better-auth/expo@1.7.7` in both repos)

```
RN app                                    hotels-api                          GitHub
──────                                    ──────────                          ──────
authClient.signIn.social({provider:"github"})
  │ src/app/(auth)/login.tsx
  ▼
POST /api/auth/sign-in/social  ─────────▶  generateState()
  (plain fetch, not a browser)              better-auth/dist/state.mjs
                                            • storeStateStrategy = "database"
                                              (isStateful=true because
                                              auth.ts sets `database: pool`)
                                            • writes a verification row,
                                              state=S, expiresAt=+600s
                                            • Set-Cookie "state"=S, signed,
                                              maxAge=300s
                                          ◀─ {redirect:true, url:<github url?state=S>}
  │ (this Set-Cookie lands in the APP's
  │  SecureStore cookie jar via the Expo
  │  client plugin - NOT a real browser)
  ▼
expoClient onSuccess hook opens a real
system browser session:
  Browser.openAuthSessionAsync(
    `${baseURL}/expo-authorization-proxy?authorizationURL=<github url w/ state=S>`)
  │
  ▼
GET /expo-authorization-proxy ──────────▶  expoAuthorizationProxy endpoint
  (real browser this time)                  @better-auth/expo/dist/index.js
                                            • reads state=S out of the given
                                              authorizationURL
                                            • sets a FRESH signed cookie
                                              "state"=S, maxAge=300s - this
                                              time in the real browser
                                          ◀─ 302 → github.com/login/oauth/authorize?state=S
  │
  ▼ (browser navigates to GitHub)
GitHub: password + "approve via GitHub
mobile app" push notification
  │
  ▼ (GitHub redirects back)
GET /api/auth/callback/github?code=…&state=S
                                        ──▶  callbackOAuth → parseState()
                                              better-auth/dist/state.mjs,
                                              parseGenericState, database branch:
                                                (a) DB lookup by state=S   — expected OK,
                                                    10 min TTL
                                                (b) c.getSignedCookie("state")
                                                    compared to S          — THIS throws
                                          ◀─ redirect → /error?error=state_mismatch
```

### Root cause (confirmed by reading the installed package, not docs/guesswork)

- `auth.ts` never sets `account.storeStateStrategy`, and `isStateful` is true
  (real Postgres `database` configured) → BetterAuth defaults to the
  `"database"` state strategy.
- The database-strategy branch of `parseGenericState`
  (`better-auth/dist/state.mjs`) runs **two independent checks**: the DB
  verification lookup, *and* a signed `state` cookie comparison — unless
  `account.skipStateCookieCheck` is set (default `false`, unset here). Both
  failure modes surface identically as `state_mismatch` to the client.
- The cookie that check (b) needs is set by `@better-auth/expo`'s
  `/expo-authorization-proxy` endpoint with a **hardcoded `maxAge: 300`**
  (5 minutes) — not configurable via any BetterAuth option. That endpoint
  exists specifically because the *original* `Set-Cookie` from
  `POST /sign-in/social` lands in the app's SecureStore (via the Expo client
  plugin), not in any real browser, so the proxy re-establishes a cookie in
  the actual system browser right before redirecting to the provider.
- GitHub's "approve via mobile app" 2FA step takes the user out to the
  GitHub app and back - easily long enough, or disruptive enough to the
  system browser session, to blow through that 5-minute window or otherwise
  lose the cookie. The DB-backed verification record (10 min TTL) is
  presumably still fine; it's specifically the cookie check that fails.

Checked for a matching upstream bug first — found none for this exact
configuration. [better-auth#6847](https://github.com/better-auth/better-auth/issues/6847)
looked related but is specific to apps explicitly on
`storeStateStrategy: "cookie"` (a cookie-*naming* bug, `oauth_state` vs
`state`); this app is consistently on `"database"` throughout, so that bug
doesn't apply here.

### Update: real root cause is more specific than "ran out of time"

Captured server-side logs (`AUTH_DEBUG_LOGGING=true`) for one attempt with
**no** multi-minute GitHub-app 2FA delay — GitHub auto-approved in ~2
seconds (device already trusted) — and it failed identically:

```
16:38:31  /sign-in/social        → state=RqhS... minted
16:38:34  /expo-authorization-proxy
            incoming cookie: better-auth.state=<STALE value from an
              earlier attempt - harmless, the proxy ignores incoming
              cookies and derives state from the authorizationURL param>
            → correctly sets Set-Cookie better-auth.state=RqhS... (matches!)
            → 302 to github.com
16:38:35  /callback/github       ← only ~1s later
            incoming headers: NO `cookie` header at all.
            → parseState throws state_security_mismatch
```

One second is nowhere near the hardcoded 300s cookie lifetime, so the
original "maxAge: 300 is too short for a slow 2FA approval" theory is
**wrong** (or at least not the operative mechanism here) - the cookie
doesn't survive even a near-instant round trip.

What *does* match a cookie vanishing across exactly this redirect shape
(`localhost` sets a cookie → immediately redirects to `github.com` → which
immediately redirects back to `localhost`) is **WebKit's anti-bounce-tracking
cookie purging** (part of Safari/WebKit's Intelligent Tracking Prevention,
which `ASWebAuthenticationSession` also runs under since it's WebKit-based).
It specifically targets "site A sets a cookie right before sending the user
to site B, which immediately sends them back to site A" as a tracking
pattern and strips the cookie A just set. That's a known, long-standing
WebKit behavior - not a timing bug, not specific to 2FA, and not fixable by
being faster or clearing more simulator state.

This makes the signed-cookie check structurally unreliable for this
redirect topology in any WebKit-based browser (Safari, `WKWebView`,
`ASWebAuthenticationSession`), independent of how long the user takes.

**Separate latent bug spotted in the same log, unrelated to the above**: the
request body for `/sign-in/social` is `{"provider":"github"}` with no
`callbackURL`. `generateState()` (`oauth2/state.mjs:18`) falls back to
`c.context.options.baseURL` (`http://localhost:3000`) when none is given.
So even on a fully successful run, the final redirect after
`/callback/github` would land the browser on a bare `http://localhost:3000`
page instead of handing control back to the app via a `hotels://` deep
link. `(auth)/login.tsx` / `register.tsx`'s `signIn.social({provider:
"github"})` call should pass an explicit `callbackURL` (something built
from `Linking.createURL(...)`) for the social path to ever actually return
to the app on success - this hasn't been reached/tested yet since the state
check fails first.

### Options (not yet decided)

1. ~~Avoid the mobile-app push-approval step (use a TOTP code instead)~~ —
   ruled out by the log above: it failed on a ~1 second round trip with no
   2FA delay at all, so this wouldn't have helped.
2. **`account.skipStateCookieCheck: true`** in `auth.ts` — drops the
   secondary cookie check, relies solely on the DB-backed verification
   record (the actual CSRF defense: a server-stored, single-use, time-boxed
   random value tied to the flow, looked up by the `state` query param -
   unaffected by WebKit's cookie purging since it isn't a cookie). Given the
   cookie check is now understood to be structurally broken by WebKit's
   anti-bounce-tracking behavior for this exact redirect shape - not just a
   tradeoff for slow 2FA - this is the clear fix. Still deliberately not
   applied without sign-off since it does relax a defense-in-depth layer.
3. Fix the `callbackURL` gap noted above regardless of (2), so a successful
   social login actually returns to the app instead of stranding the user
   on a bare `localhost:3000` page in the browser.

No version upgrade/downgrade is implicated - `better-auth` and
`@better-auth/expo` are already at the same `1.7.7` in both repos, and
there's no newer release found that specifically addresses this.

### Not GitHub-specific

`/expo-authorization-proxy` and the cookie check in `parseGenericState` are
both provider-agnostic - they live in `@better-auth/expo` and core
`better-auth`, with no GitHub-specific code involved. The log above shows
the cookie vanishing in ~1 second with no 2FA step at all, so this will
reproduce identically for Google (or any other social provider) the moment
one is added to `socialProviders` - the redirect shape
(`localhost → provider → localhost`) is what triggers it, not which
provider or which 2FA method sits in the middle.
