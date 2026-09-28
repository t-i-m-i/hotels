import { apiClient } from "@/api/client";
import type { components } from "@/api/generated/schema";

export type RegisterPushTokenDto =
  components["schemas"]["RegisterPushTokenDto"];

export async function registerPushToken(
  body: RegisterPushTokenDto,
): Promise<void> {
  const { error } = await apiClient.POST("/push-tokens", { body });
  if (error) {
    throw new Error("Failed to register push token");
  }
}
