import { apiClient } from "@/api/client";
import type { components } from "@/api/generated/schema";

export type Hotel = components["schemas"]["HotelDto"];
export type PaginatedHotels = components["schemas"]["PaginatedHotelsDto"];

export async function getHotels(search?: string): Promise<Hotel[]> {
  const { data, error } = await apiClient.GET("/hotels", {
    params: { query: { search } },
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function getHotelsPaginated(
  page: number,
): Promise<PaginatedHotels> {
  const { data, error } = await apiClient.GET("/hotels/paginated", {
    params: { query: { page } },
  });
  if (error) {
    throw error;
  }
  await new Promise((r) => setTimeout(r, 1000));
  return data;
}

export async function getHotel(id: string): Promise<Hotel> {
  const { data, error } = await apiClient.GET("/hotels/{id}", {
    params: { path: { id } },
  });
  if (error || !data) {
    throw error ?? new Error(`Hotel with id "${id}" not found`);
  }
  return data;
}
