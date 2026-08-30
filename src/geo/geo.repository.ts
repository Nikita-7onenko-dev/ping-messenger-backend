import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import type { GeoCache, GeoLocation } from "./geo.types.js";

class GeoRepository {
  async getCachedLocation(ip: string): Promise<GeoLocation | null> {
    try {
      const result = await pool.query<GeoLocation>(
        `SELECT country, city
          FROM geo_cache
          WHERE ip_address = $1`,
        [ip],
      );

      const [geoData] = result.rows;

      if (!geoData) return null;

      return {
        country: geoData.country,
        city: geoData.city,
      };
    } catch (err) {
      throw translateDBError(err, "geo_data");
    }
  }

  async cacheLocation(geoData: GeoCache) {
    try {
      await pool.query(
        `INSERT INTO geo_cache (ip_address, country, city)
          VALUES ($1, $2, $3)
          ON CONFLICT (ip_address) DO NOTHING`,
        [geoData.ipAddress, geoData.country, geoData.city],
      );
    } catch (err) {
      throw translateDBError(err, "geo_data");
    }
  }
}

const geoRepository = new GeoRepository();
export { geoRepository };
