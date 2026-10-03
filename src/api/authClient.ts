import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getApiBaseUrl } from "./getApiBaseUrl";

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  plugins: [
    expoClient({
      scheme: "hotels",
      storagePrefix: "hotels",
      storage: SecureStore,
    }),
  ],
});

// hotels-api's auth.ts attaches `roles: string[]` to every session via its
// customSession plugin (a fresh user_roles -> roles join per request — see
// that repo's src/auth/auth.ts). There's no shared package between the two
// repos to infer this from (better-auth's customSessionClient() requires
// importing the server's actual Auth instance type), so it's declared by
// hand here instead — keep this in sync if the server's customSession
// shape ever changes.
export type SessionUser = NonNullable<
  ReturnType<typeof authClient.useSession>["data"]
>["user"] & {
  roles: string[];
};
