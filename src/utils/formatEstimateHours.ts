export function formatEstimateHours(minutes: number | null): string {
  return minutes === null ? "Chưa có" : `${minutes / 60} giờ`;
}
