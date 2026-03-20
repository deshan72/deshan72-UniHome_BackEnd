// SLIIT Malabe coordinates
const SLIIT_LAT = 6.9147;
const SLIIT_LNG = 79.9729;

/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const distanceToSLIIT = (lat, lng) => haversine(lat, lng, SLIIT_LAT, SLIIT_LNG);
