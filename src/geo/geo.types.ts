export type GeoLocation = {
  country: string;
  city: string | null;
};

export type GeoCacheEntry = GeoLocation & {
  ipAddress: string;
};

export type GeoApiResponse = {
  country: string;
  city: string | null;
};

export type GeoCacheRow = {
  ip_address: string;
  country: string;
  city: string | null;
};
