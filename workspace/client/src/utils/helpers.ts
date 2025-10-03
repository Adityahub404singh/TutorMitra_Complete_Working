export const BADGE_COLORS: Record<string, string> = {
  online: "bg-blue-500",
  offline: "bg-green-600",
  both: "bg-purple-600",
};

export function formatTime(time24?: string): string {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}
