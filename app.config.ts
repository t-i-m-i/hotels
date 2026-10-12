import type { ConfigContext, ExpoConfig } from "expo/config";
import { withEntitlementsPlist } from "expo/config-plugins";

// Free Apple "personal teams" can't provision the Push Notifications
// capability, so device builds with a free account must not carry the
// aps-environment entitlement. `bun run ios:device` sets PUSH=0 for that.
// See docs/guides/notifications.md.
const pushEnabled = process.env.PUSH !== "0";

export default ({ config }: ConfigContext): ExpoConfig => {
  const next: ExpoConfig = {
    ...config,
    name: config.name ?? "hotels",
    slug: config.slug ?? "hotels",
    extra: { ...config.extra, pushEnabled },
  };
  if (pushEnabled) {
    return next;
  }
  // expo-notifications' plugin is applied automatically whenever the package
  // is installed (even if not in `plugins`), so strip what it adds instead.
  return withEntitlementsPlist(next, (c) => {
    delete c.modResults["aps-environment"];
    return c;
  });
};
