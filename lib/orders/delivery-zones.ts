export type DeliveryZoneId = "lagos_island" | "lagos_mainland" | "interstate";

export interface DeliveryZone {
  id: DeliveryZoneId;
  name: string;
  description: string;
  fee: number;
}

export const DELIVERY_ZONES: Record<DeliveryZoneId, DeliveryZone> = {
  lagos_island: {
    id: "lagos_island",
    name: "Lagos Island (Ikoyi, Victoria Island, Lekki, Ajah)",
    description: "Express 24h delivery within Lagos Island",
    fee: 2000,
  },
  lagos_mainland: {
    id: "lagos_mainland",
    name: "Lagos Mainland (Ikeja, Surulere, Yaba, Maryland, etc.)",
    description: "Express 24h delivery across Lagos Mainland",
    fee: 3000,
  },
  interstate: {
    id: "interstate",
    name: "Interstate Delivery (Abuja, Port Harcourt, Ibadan, etc.)",
    description: "Priority nationwide shipping within Nigeria",
    fee: 5000,
  },
};

export const DEFAULT_DELIVERY_ZONE: DeliveryZoneId = "lagos_island";

export function getDeliveryFee(zoneId?: string | null): number {
  if (!zoneId || !(zoneId in DELIVERY_ZONES)) {
    return DELIVERY_ZONES[DEFAULT_DELIVERY_ZONE].fee;
  }
  return DELIVERY_ZONES[zoneId as DeliveryZoneId].fee;
}

export function isValidDeliveryZone(zoneId: string): zoneId is DeliveryZoneId {
  return zoneId in DELIVERY_ZONES;
}
