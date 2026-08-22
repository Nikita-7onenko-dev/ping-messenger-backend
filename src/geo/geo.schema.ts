import { z } from "zod";
import type { GeoApiResponse } from "./geo.types.js";

const geoApiResponseSchema = z.object({
  country: z.string(),
  city: z.string().nullable(),
});

export function validateApiResponse(res: unknown): GeoApiResponse {
  return geoApiResponseSchema.parse(res);
}
