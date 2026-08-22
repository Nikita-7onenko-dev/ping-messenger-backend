import { z } from "zod";

const geoApiResponseSchema = z.object({
  country: z.string(),
  city: z.string().nullable(),
});

export async function getGeoLocation(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (!response.ok) {
      const location = await response.json();
      console.log(response.status, location);
      return null;
    }

    const location = await response.json();
    return geoApiResponseSchema.parse(location);
  } catch (err) {
    console.error(err);
    return null;
  }
}
