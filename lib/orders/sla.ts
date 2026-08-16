const DELIVERY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Whole hours remaining until the 24-hour delivery deadline for a confirmed
 * order (negative when already past due). The window starts at `confirmedAt`,
 * i.e. when payment was verified server-side.
 */
export function hoursRemainingInDeliveryWindow(confirmedAt: Date): number {
  const deadline = new Date(confirmedAt).getTime() + DELIVERY_WINDOW_MS;
  return Math.round((deadline - Date.now()) / MS_PER_HOUR);
}
