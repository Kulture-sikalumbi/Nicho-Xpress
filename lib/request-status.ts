export const requestStatuses = [
  "received",
  "reviewing",
  "quoted",
  "approved",
  "purchased",
  "in_transit",
  "ready",
  "delivered",
  "declined",
  "cancelled",
] as const;

export type RequestStatus = (typeof requestStatuses)[number];
