import { getGeoLocation } from "./geo.api.js";
import { geoRepository } from "./geo.repository.js";

class GeoService {
  async getGeoLocation(ip: string | null) {
    if (!ip) return { country: null, city: null };

    const cachedLocation = await geoRepository.getCachedLocation(ip);
    if (cachedLocation) return cachedLocation;

    const location = await getGeoLocation(ip);
    if (!location || !location.country_name)
      return { country: null, city: null };

    const { city, country_name: country } = location;

    await geoRepository.cacheLocation({
      ipAddress: ip,
      city,
      country,
    });

    return { city, country };
  }
}

const geoService = new GeoService();
export { geoService };
