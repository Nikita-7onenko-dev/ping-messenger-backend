export type GeoLocation = {
  country: string;
  city: string | null;
};

export type GeoCache = GeoLocation & {
  ipAddress: string;
};

export type GeoApiResponse = {
  country: string;
  city: string | null;
};
