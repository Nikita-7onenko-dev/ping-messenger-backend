import { z } from "zod";

const geoApiResponseSchema = z.object({
  location: z.object({
    country_name: z.string(),
    city: z.string().nullable(),
  }),
});

export async function getGeoLocation(ip: string) {
  try {
    const response = await fetch(
      `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${process.env.GEO_API_KEY}&ip=${ip}`,
    );

    if (!response.ok) {
      const result = await response.json();
      console.log(response.status, result);
      return null;
    }

    const result = await response.json();
    console.log(result);
    return geoApiResponseSchema.parse(result).location;
  } catch (err) {
    console.error(err);
    return null;
  }
}
