import { hotelArraySchema } from "./hotel";

const validHotel = {
  id: "1",
  name: "Hotel Barcino Central",
  description: "A boutique hotel.",
  location: "Barcelona, Spain",
  geo: { latitude: 41.38, longitude: 2.17 },
  images: [{ path: "a.jpg", alt: "Lobby", width: 800, height: 600 }],
};

describe("hotelArraySchema", () => {
  it("accepts valid hotels and keeps unknown keys", () => {
    const result = hotelArraySchema.safeParse([
      { ...validHotel, distanceMeters: 1250 },
    ]);
    expect(result.success).toBe(true);
    expect(result.data?.[0].distanceMeters).toBe(1250);
  });

  it("accepts an empty array", () => {
    expect(hotelArraySchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-arrays and malformed items", () => {
    expect(hotelArraySchema.safeParse({}).success).toBe(false);
    expect(hotelArraySchema.safeParse([{ id: "1" }]).success).toBe(false);
    expect(
      hotelArraySchema.safeParse([
        { ...validHotel, geo: { latitude: 200, longitude: 0 } },
      ]).success,
    ).toBe(false);
  });
});
